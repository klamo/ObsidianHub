import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, readFile, rm } from "node:fs/promises";

import {
  ServerNoteActionExecutor,
  validateNoteAction,
} from "../dist/index.js";
import { Vault } from "../../vault/dist/index.js";

test("validateNoteAction accepts create_note payload", () => {
  const result = validateNoteAction({
    action: "create_note",
    requestId: "req_1",
    payload: {
      path: "notes/example.md",
      body: "Body\n",
      frontmatter: {
        mode: "replace",
        data: { title: "Example" },
      },
      writeStrategy: "atomic",
    },
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.action, "create_note");
    assert.equal(result.value.payload.path, "notes/example.md");
  }
});

test("validateNoteAction rejects unsupported action", () => {
  const result = validateNoteAction({
    action: "delete_everything",
    payload: {},
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "VALIDATION_ERROR");
  }
});

test("ServerNoteActionExecutor can create and read a note", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-actions-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    const executor = new ServerNoteActionExecutor(vault);

    const createAction = validateNoteAction({
      action: "create_note",
      requestId: "req_create",
      payload: {
        path: "notes/example.md",
        body: "Body\n",
        frontmatter: {
          mode: "replace",
          data: { title: "Example" },
        },
      },
    });

    assert.equal(createAction.ok, true);
    if (!createAction.ok) assert.fail("expected action validation to succeed");

    const createResult = await executor.execute(createAction.value);
    assert.equal(createResult.ok, true);

    const readAction = validateNoteAction({
      action: "read_note",
      requestId: "req_read",
      payload: {
        path: "notes/example.md",
      },
    });

    assert.equal(readAction.ok, true);
    if (!readAction.ok) assert.fail("expected action validation to succeed");

    const readResult = await executor.execute(readAction.value);
    assert.equal(readResult.ok, true);
    if (readResult.ok) {
      assert.equal(readResult.value.result.path, "notes/example.md");
      assert.equal(readResult.value.result.document.frontmatter.title, "Example");
      assert.equal(readResult.value.meta.executor, "server-vault-executor");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("ServerNoteActionExecutor can update body and rename note", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-actions-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    const executor = new ServerNoteActionExecutor(vault);

    await vault.createNote("notes/example.md", "Body\n", {
      frontmatter: {
        mode: "replace",
        data: { title: "Example" },
      },
    });

    const updateAction = validateNoteAction({
      action: "update_note_body",
      payload: {
        path: "notes/example.md",
        body: "Updated\n",
        writeStrategy: "atomic",
      },
    });
    assert.equal(updateAction.ok, true);
    if (!updateAction.ok) assert.fail("expected action validation to succeed");

    const updateResult = await executor.execute(updateAction.value);
    assert.equal(updateResult.ok, true);

    const renameAction = validateNoteAction({
      action: "rename_note",
      payload: {
        fromPath: "notes/example.md",
        toPath: "archive/example.md",
      },
    });
    assert.equal(renameAction.ok, true);
    if (!renameAction.ok) assert.fail("expected action validation to succeed");

    const renameResult = await executor.execute(renameAction.value);
    assert.equal(renameResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "archive/example.md"), "utf8");
    assert.equal(nextContent, "---\ntitle: Example\n---\nUpdated\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("ServerNoteActionExecutor surfaces conflict on duplicate create", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-actions-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    const executor = new ServerNoteActionExecutor(vault);
    await vault.createNote("notes/example.md", "Body\n");

    const action = validateNoteAction({
      action: "create_note",
      payload: {
        path: "notes/example.md",
        body: "Again\n",
      },
    });
    assert.equal(action.ok, true);
    if (!action.ok) assert.fail("expected action validation to succeed");

    const result = await executor.execute(action.value);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "CONFLICT");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
