import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";

import { Vault, normalizeVaultPath } from "../dist/index.js";

test("normalizeVaultPath rejects traversal", () => {
  assert.throws(() => normalizeVaultPath("../secret.md"));
  assert.throws(() => normalizeVaultPath("/../../secret.md"));
});

test("Vault writes and reads text within the mounted root", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    const writeResult = await vault.writeText("notes/example.md", "# Hello");
    assert.equal(writeResult.ok, true);

    const readResult = await vault.readText("notes/example.md");
    assert.equal(readResult.ok, true);

    if (readResult.ok) {
      assert.equal(readResult.value.path, "notes/example.md");
      assert.equal(readResult.value.content, "# Hello");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

