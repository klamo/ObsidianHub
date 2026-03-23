import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { access, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";

import {
  Vault,
  normalizeVaultPath,
  parseFrontmatterRecord,
  splitFrontmatterDocument,
} from "../dist/index.js";

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

test("parseFrontmatterRecord parses simple yaml mappings", () => {
  const record = parseFrontmatterRecord("---\ntitle: Example\ndraft: false\ntags:\n  - demo\n  - note\nmeta:\n  kind: seed\n---\nBody\n");

  assert.deepEqual(record, {
    title: "Example",
    draft: false,
    tags: ["demo", "note"],
    meta: {
      kind: "seed",
    },
  });
});

test("Vault createNote creates a note and rejects duplicate create by default", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });

    const createResult = await vault.createNote("notes/example.md", "Body\n", {
      frontmatter: {
        mode: "replace",
        data: { title: "Example" },
      },
    });

    assert.equal(createResult.ok, true);

    const duplicateResult = await vault.createNote("notes/example.md", "Again\n");
    assert.equal(duplicateResult.ok, false);
    if (!duplicateResult.ok) {
      assert.equal(duplicateResult.error.code, "CONFLICT");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
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

test("Vault writeText can replace frontmatter while preserving body", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });

    const writeResult = await vault.writeText("notes/example.md", "Body\n", {
      frontmatter: {
        mode: "replace",
        data: {
          title: "Example",
          draft: false,
        },
      },
    });

    assert.equal(writeResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "notes/example.md"), "utf8");
    assert.equal(nextContent, "---\ntitle: Example\ndraft: false\n---\nBody\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault writeText can merge frontmatter into an existing note", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });

    const writeResult = await vault.writeText(
      "notes/example.md",
      "---\ntitle: Example\ntags:\n  - old\n---\nBody\n",
      {
        frontmatter: {
          mode: "merge",
          data: {
            tags: ["new"],
            draft: true,
          },
        },
      },
    );

    assert.equal(writeResult.ok, true);

    const noteResult = await vault.readNote("notes/example.md");
    assert.equal(noteResult.ok, true);

    if (noteResult.ok) {
      assert.deepEqual(parseFrontmatterRecord(noteResult.value.content), {
        title: "Example",
        tags: ["new"],
        draft: true,
      });
      assert.equal(noteResult.value.document.body, "Body\n");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault updateFrontmatter reads existing note, mutates frontmatter, and preserves body", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "---\ntitle: Example\n---\nBody\n");

    const updateResult = await vault.updateFrontmatter("notes/example.md", {
      mode: "merge",
      data: {
        draft: true,
      },
    });

    assert.equal(updateResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "notes/example.md"), "utf8");
    assert.equal(nextContent, "---\ntitle: Example\ndraft: true\n---\nBody\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault updateNoteBody preserves frontmatter and updates only body", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "---\ntitle: Example\n---\nOld\n");

    const updateResult = await vault.updateNoteBody("notes/example.md", "New\n", {
      writeStrategy: { mode: "atomic" },
    });

    assert.equal(updateResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "notes/example.md"), "utf8");
    assert.equal(nextContent, "---\ntitle: Example\n---\nNew\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault renameNote moves a note to a new path", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "Body\n");

    const renameResult = await vault.renameNote("notes/example.md", "archive/example-renamed.md");
    assert.equal(renameResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "archive/example-renamed.md"), "utf8");
    assert.equal(nextContent, "Body\n");

    await assert.rejects(access(path.join(tempRoot, "notes/example.md")));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault archiveNote moves a note under .obsidianhub/archive", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "Body\n");

    const archiveResult = await vault.archiveNote("notes/example.md");
    assert.equal(archiveResult.ok, true);

    if (archiveResult.ok) {
      assert.match(archiveResult.value.toPath, /^\.obsidianhub\/archive\/notes\/example\.md\./);
      const archivedContent = await readFile(archiveResult.value.toAbsolutePath, "utf8");
      assert.equal(archivedContent, "Body\n");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault updateFrontmatter returns conflict when file changes after read", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "---\ntitle: Example\n---\nBody\n");

    const noteResult = await vault.readNote("notes/example.md");
    assert.equal(noteResult.ok, true);
    if (!noteResult.ok) {
      assert.fail("expected note read to succeed");
    }

    await new Promise((resolve) => setTimeout(resolve, 20));
    await vault.writeText("notes/example.md", "---\ntitle: Changed\n---\nBody\n");

    const updateResult = await vault.updateFrontmatter(
      "notes/example.md",
      {
        mode: "merge",
        data: {
          draft: true,
        },
      },
      {
        expectedMtimeMs: noteResult.value.mtimeMs,
        writeStrategy: { mode: "atomic" },
      },
    );

    assert.equal(updateResult.ok, false);
    if (!updateResult.ok) {
      assert.equal(updateResult.error.code, "CONFLICT");
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault atomic write replaces file content and leaves no temp files behind", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "old\n");
    const beforeStat = await stat(path.join(tempRoot, "notes/example.md"));

    const writeResult = await vault.writeText("notes/example.md", "new\n", {
      writeStrategy: { mode: "atomic" },
    });

    assert.equal(writeResult.ok, true);

    const nextContent = await readFile(path.join(tempRoot, "notes/example.md"), "utf8");
    assert.equal(nextContent, "new\n");

    const directoryEntries = await readdir(path.join(tempRoot, "notes"));
    assert.equal(directoryEntries.some((entry) => entry.startsWith(".obsidianhub-tmp-")), false);

    const afterStat = await stat(path.join(tempRoot, "notes/example.md"));
    assert.equal(afterStat.mtimeMs >= beforeStat.mtimeMs, true);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("Vault atomic write returns conflict when expected mtime is stale", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "obsidianhub-vault-test-"));

  try {
    const vault = new Vault({ rootPath: tempRoot });
    await vault.writeText("notes/example.md", "old\n");

    const readResult = await vault.readText("notes/example.md");
    assert.equal(readResult.ok, true);
    if (!readResult.ok) {
      assert.fail("expected text read to succeed");
    }

    await new Promise((resolve) => setTimeout(resolve, 20));
    await vault.writeText("notes/example.md", "external\n");

    const writeResult = await vault.writeText("notes/example.md", "new\n", {
      expectedMtimeMs: readResult.value.mtimeMs,
      writeStrategy: { mode: "atomic" },
    });

    assert.equal(writeResult.ok, false);
    if (!writeResult.ok) {
      assert.equal(writeResult.error.code, "CONFLICT");
    }

    const finalContent = await readFile(path.join(tempRoot, "notes/example.md"), "utf8");
    assert.equal(finalContent, "external\n");
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
