import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";

import { executeNoteActionRequest } from "../src/server/note-actions.ts";

test("executeNoteActionRequest returns 400 for schema validation failure", async () => {
  const result = await executeNoteActionRequest({
    action: "create_note",
    payload: {
      body: "Missing path",
    },
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.action, "create_note");
  assert.equal(result.body.error.code, "VALIDATION_ERROR");
});

test("executeNoteActionRequest returns request-safe error body for non-object input", async () => {
  const result = await executeNoteActionRequest(null);

  assert.equal(result.status, 400);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.action, undefined);
  assert.equal(result.body.error.code, "VALIDATION_ERROR");
});

test("executeNoteActionRequest can create and read a note", async () => {
  const vaultRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-web-route-test-"));
  const previousVaultEnv = process.env.OBSIDIANHUB_VAULT_DIR;
  process.env.OBSIDIANHUB_VAULT_DIR = vaultRoot;

  try {
    const createResult = await executeNoteActionRequest({
      action: "create_note",
      requestId: "req_create_note",
      payload: {
        path: "notes/api-test.md",
        body: "Body from API test\n",
        frontmatter: {
          mode: "replace",
          data: {
            title: "API Test",
          },
        },
      },
    });

    assert.equal(createResult.status, 200);
    assert.equal(createResult.body.ok, true);
    assert.equal(createResult.body.action, "create_note");

    const readResult = await executeNoteActionRequest({
      action: "read_note",
      requestId: "req_read_note",
      payload: {
        path: "notes/api-test.md",
      },
    });

    assert.equal(readResult.status, 200);
    assert.equal(readResult.body.ok, true);
    assert.equal(readResult.body.action, "read_note");

    if (readResult.body.ok) {
      assert.equal(readResult.body.result.path, "notes/api-test.md");
      assert.equal(readResult.body.result.document.frontmatter.title, "API Test");
    }
  } finally {
    if (previousVaultEnv === undefined) {
      delete process.env.OBSIDIANHUB_VAULT_DIR;
    } else {
      process.env.OBSIDIANHUB_VAULT_DIR = previousVaultEnv;
    }
    await rm(vaultRoot, { recursive: true, force: true });
  }
});
