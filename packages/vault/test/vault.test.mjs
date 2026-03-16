import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, readFile, rm } from "node:fs/promises";

import { Vault, normalizeVaultPath, splitFrontmatterDocument } from "../dist/index.js";

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

test("splitFrontmatterDocument separates frontmatter from markdown body", () => {
  const document = splitFrontmatterDocument("---\ntitle: Example\ntags:\n  - demo\n---\n# Heading\n");

  assert.equal(document.frontmatter?.raw, "---\ntitle: Example\ntags:\n  - demo\n---");
  assert.equal(document.body, "# Heading\n");
  assert.equal(document.bodyStartOffset, document.frontmatter?.endOffset + 1);
});

test("Vault can read note structure and create a backup before overwrite", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "---\ntitle: First\n---\nBody\n");

    const noteResult = await vault.readNote("notes/example.md");
    assert.equal(noteResult.ok, true);

    if (noteResult.ok) {
      assert.equal(noteResult.value.document.frontmatter?.raw, "---\ntitle: First\n---");
      assert.equal(noteResult.value.document.body, "Body\n");
    }

    const overwriteResult = await vault.writeText("notes/example.md", "Updated\n", {
      backup: { enabled: true },
    });

    assert.equal(overwriteResult.ok, true);

    if (overwriteResult.ok) {
      assert.match(overwriteResult.value.backup?.path ?? "", /^\.obsidianhub\/backups\/notes\/example\.md\./);

      const backupContent = await readFile(overwriteResult.value.backup.absolutePath, "utf8");
      assert.equal(backupContent, "---\ntitle: First\n---\nBody\n");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
