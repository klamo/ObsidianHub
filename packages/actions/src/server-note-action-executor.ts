import {
  type ConflictError,
  type NotFoundError,
  type PathAccessError,
  type Result,
  ValidationError,
  err,
  ok,
} from "../../core/dist/index.js";
import { parseFrontmatterRecord, Vault } from "../../vault/dist/index.js";

import type {
  NoteAction,
  NoteActionMeta,
  NoteActionResult,
  NoteActionName,
  ReadNoteAction,
} from "./note-actions.js";

export type NoteActionExecutionError = ConflictError | NotFoundError | PathAccessError | ValidationError;

export interface NoteActionExecutionSuccess<TAction extends NoteActionName> {
  requestId?: string;
  action: TAction;
  result: NoteActionResult<TAction>;
  meta: NoteActionMeta;
}

export class ServerNoteActionExecutor {
  constructor(private readonly vault: Vault) {}

  async execute<TAction extends NoteAction>(
    action: TAction,
  ): Promise<Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>> {
    switch (action.action) {
      case "read_note":
        return this.executeReadNote(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      case "create_note":
        return this.executeCreateNote(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      case "update_note_body":
        return this.executeUpdateNoteBody(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      case "update_frontmatter":
        return this.executeUpdateFrontmatter(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      case "rename_note":
        return this.executeRenameNote(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      case "archive_note":
        return this.executeArchiveNote(action) as Promise<
          Result<NoteActionExecutionSuccess<TAction["action"]>, NoteActionExecutionError>
        >;
      default:
        return err(new ValidationError("Unsupported action."));
    }
  }

  private async executeReadNote(action: ReadNoteAction) {
    const readResult = await this.vault.readNote(action.payload.path);
    if (!readResult.ok) {
      return readResult;
    }

    const include = action.payload.include ?? {};
    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        path: readResult.value.path,
        content: include.raw === false ? undefined : readResult.value.content,
        document:
          include.frontmatter === false && include.body === false
            ? undefined
            : {
                frontmatter: readResult.value.document.frontmatter
                  ? parseFrontmatterRecord(readResult.value.content)
                  : {},
                body: include.body === false ? "" : readResult.value.document.body,
              },
        mtimeMs: readResult.value.mtimeMs,
        size: readResult.value.size,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }

  private async executeCreateNote(action: Extract<NoteAction, { action: "create_note" }>) {
    const writeResult = await this.vault.createNote(action.payload.path, action.payload.body, {
      frontmatter: action.payload.frontmatter,
      writeStrategy: action.payload.writeStrategy ? { mode: action.payload.writeStrategy } : undefined,
    });

    if (!writeResult.ok) {
      return writeResult;
    }

    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        path: writeResult.value.path,
        created: writeResult.value.created,
        mtimeMs: writeResult.value.mtimeMs,
        bytesWritten: writeResult.value.bytesWritten,
        backup: writeResult.value.backup ? { path: writeResult.value.backup.path } : undefined,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }

  private async executeUpdateNoteBody(action: Extract<NoteAction, { action: "update_note_body" }>) {
    const writeResult = await this.vault.updateNoteBody(action.payload.path, action.payload.body, {
      expectedMtimeMs: action.payload.expectedMtimeMs,
      writeStrategy: action.payload.writeStrategy ? { mode: action.payload.writeStrategy } : undefined,
      backup: action.payload.backup ? { enabled: true } : undefined,
    });

    if (!writeResult.ok) {
      return writeResult;
    }

    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        path: writeResult.value.path,
        created: writeResult.value.created,
        mtimeMs: writeResult.value.mtimeMs,
        bytesWritten: writeResult.value.bytesWritten,
        backup: writeResult.value.backup ? { path: writeResult.value.backup.path } : undefined,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }

  private async executeUpdateFrontmatter(action: Extract<NoteAction, { action: "update_frontmatter" }>) {
    const writeResult = await this.vault.updateFrontmatter(action.payload.path, action.payload.mutation, {
      expectedMtimeMs: action.payload.expectedMtimeMs,
      writeStrategy: action.payload.writeStrategy ? { mode: action.payload.writeStrategy } : undefined,
      backup: action.payload.backup ? { enabled: true } : undefined,
    });

    if (!writeResult.ok) {
      return writeResult;
    }

    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        path: writeResult.value.path,
        created: writeResult.value.created,
        mtimeMs: writeResult.value.mtimeMs,
        bytesWritten: writeResult.value.bytesWritten,
        backup: writeResult.value.backup ? { path: writeResult.value.backup.path } : undefined,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }

  private async executeRenameNote(action: Extract<NoteAction, { action: "rename_note" }>) {
    const moveResult = await this.vault.renameNote(action.payload.fromPath, action.payload.toPath);
    if (!moveResult.ok) {
      return moveResult;
    }

    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        fromPath: moveResult.value.fromPath,
        toPath: moveResult.value.toPath,
        mtimeMs: moveResult.value.mtimeMs,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }

  private async executeArchiveNote(action: Extract<NoteAction, { action: "archive_note" }>) {
    const moveResult = await this.vault.archiveNote(action.payload.path);
    if (!moveResult.ok) {
      return moveResult;
    }

    return ok({
      requestId: action.requestId,
      action: action.action,
      result: {
        fromPath: moveResult.value.fromPath,
        toPath: moveResult.value.toPath,
        mtimeMs: moveResult.value.mtimeMs,
      },
      meta: {
        executor: "server-vault-executor",
      },
    });
  }
}
