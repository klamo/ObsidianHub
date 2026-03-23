import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { mkdtemp, rm } from "node:fs/promises";

import { executeNoteActionRequest } from "../src/server/note-actions.ts";

test("note action request returns 400 for invalid payload", async () => {
  const response = await executeNoteActionRequest(null);

  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("note action request can create a note and returns envelope", async () => {
  const tempVault = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-web-api-test-"));
  const previousVaultDir = process.env.OBSIDIANHUB_VAULT_DIR;

  process.env.OBSIDIANHUB_VAULT_DIR = tempVault;

  try {
    const response = await executeNoteActionRequest({
      action: "create_note",
      requestId: "req_create_1",
      payload: {
        path: "notes/api-test.md",
        body: "hello from route test\n",
      },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.action, "create_note");
    assert.equal(response.body.requestId, "req_create_1");
    assert.equal(response.body.result.path, "notes/api-test.md");
    assert.equal(response.body.meta.executor, "server-vault-executor");
  } finally {
    if (previousVaultDir === undefined) {
      delete process.env.OBSIDIANHUB_VAULT_DIR;
    } else {
      process.env.OBSIDIANHUB_VAULT_DIR = previousVaultDir;
    }
    await rm(tempVault, { recursive: true, force: true });
  }
});

test("note action request returns 409 for duplicate create", async () => {
  const tempVault = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-web-api-test-"));
  const previousVaultDir = process.env.OBSIDIANHUB_VAULT_DIR;

  process.env.OBSIDIANHUB_VAULT_DIR = tempVault;

  try {
    const first = await executeNoteActionRequest({
      action: "create_note",
      requestId: "req_conflict_1",
      payload: {
        path: "notes/duplicate.md",
        body: "first\n",
      },
    });
    assert.equal(first.status, 200);

    const second = await executeNoteActionRequest({
      action: "create_note",
      requestId: "req_conflict_2",
      payload: {
        path: "notes/duplicate.md",
        body: "second\n",
      },
    });

    assert.equal(second.status, 409);
    assert.equal(second.body.ok, false);
    assert.equal(second.body.error.code, "CONFLICT");
    assert.equal(second.body.action, "create_note");
    assert.equal(second.body.requestId, "req_conflict_2");
  } finally {
    if (previousVaultDir === undefined) {
      delete process.env.OBSIDIANHUB_VAULT_DIR;
    } else {
      process.env.OBSIDIANHUB_VAULT_DIR = previousVaultDir;
    }
    await rm(tempVault, { recursive: true, force: true });
  }
});
