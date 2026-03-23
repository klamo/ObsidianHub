import { ValidationError, type Result, err, ok } from "../../core/dist/index.js";
import type { FrontmatterRecord } from "../../vault/dist/index.d.ts";

import type {
  ArchiveNoteAction,
  CreateNoteAction,
  NoteAction,
  NoteActionActor,
  ReadNoteAction,
  RenameNoteAction,
  UpdateFrontmatterAction,
  UpdateNoteBodyAction,
} from "./note-actions.js";

export function validateNoteAction(input: unknown): Result<NoteAction, ValidationError> {
  if (!isPlainObject(input)) {
    return err(new ValidationError("Note action envelope must be an object."));
  }

  const action = input.action;
  if (typeof action !== "string") {
    return err(new ValidationError("Note action name is required."));
  }

  switch (action) {
    case "read_note":
      return validateReadNoteAction(input);
    case "create_note":
      return validateCreateNoteAction(input);
    case "update_note_body":
      return validateUpdateNoteBodyAction(input);
    case "update_frontmatter":
      return validateUpdateFrontmatterAction(input);
    case "rename_note":
      return validateRenameNoteAction(input);
    case "archive_note":
      return validateArchiveNoteAction(input);
    default:
      return err(new ValidationError("Unsupported note action.", { action }));
  }
}

function validateReadNoteAction(input: Record<string, unknown>): Result<ReadNoteAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const path = requireString(payload.value.path, "payload.path");
  if (!path.ok) return path;

  return ok({
    action: "read_note",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      path: path.value,
      include: isPlainObject(payload.value.include)
        ? {
            raw: optionalBoolean(payload.value.include.raw),
            frontmatter: optionalBoolean(payload.value.include.frontmatter),
            body: optionalBoolean(payload.value.include.body),
          }
        : undefined,
    },
  });
}

function validateCreateNoteAction(input: Record<string, unknown>): Result<CreateNoteAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const path = requireString(payload.value.path, "payload.path");
  if (!path.ok) return path;
  const body = requireString(payload.value.body, "payload.body");
  if (!body.ok) return body;
  const writeStrategy = optionalWriteStrategy(payload.value.writeStrategy);
  if (!writeStrategy.ok) return writeStrategy;
  const frontmatter = optionalFrontmatterMutation(payload.value.frontmatter, "payload.frontmatter");
  if (!frontmatter.ok) return frontmatter;

  return ok({
    action: "create_note",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      path: path.value,
      body: body.value,
      frontmatter: frontmatter.value,
      writeStrategy: writeStrategy.value,
    },
  });
}

function validateUpdateNoteBodyAction(
  input: Record<string, unknown>,
): Result<UpdateNoteBodyAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const path = requireString(payload.value.path, "payload.path");
  if (!path.ok) return path;
  const body = requireString(payload.value.body, "payload.body");
  if (!body.ok) return body;
  const expectedMtimeMs = optionalNumber(payload.value.expectedMtimeMs, "payload.expectedMtimeMs");
  if (!expectedMtimeMs.ok) return expectedMtimeMs;
  const writeStrategy = optionalWriteStrategy(payload.value.writeStrategy);
  if (!writeStrategy.ok) return writeStrategy;
  const backup = optionalBoolean(payload.value.backup);

  return ok({
    action: "update_note_body",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      path: path.value,
      body: body.value,
      expectedMtimeMs: expectedMtimeMs.value,
      writeStrategy: writeStrategy.value,
      backup,
    },
  });
}

function validateUpdateFrontmatterAction(
  input: Record<string, unknown>,
): Result<UpdateFrontmatterAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const path = requireString(payload.value.path, "payload.path");
  if (!path.ok) return path;
  const mutation = optionalFrontmatterMutation(payload.value.mutation, "payload.mutation");
  if (!mutation.ok || !mutation.value) {
    return err(new ValidationError("payload.mutation is required."));
  }
  const expectedMtimeMs = optionalNumber(payload.value.expectedMtimeMs, "payload.expectedMtimeMs");
  if (!expectedMtimeMs.ok) return expectedMtimeMs;
  const writeStrategy = optionalWriteStrategy(payload.value.writeStrategy);
  if (!writeStrategy.ok) return writeStrategy;
  const backup = optionalBoolean(payload.value.backup);

  return ok({
    action: "update_frontmatter",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      path: path.value,
      mutation: mutation.value,
      expectedMtimeMs: expectedMtimeMs.value,
      writeStrategy: writeStrategy.value,
      backup,
    },
  });
}

function validateRenameNoteAction(input: Record<string, unknown>): Result<RenameNoteAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const fromPath = requireString(payload.value.fromPath, "payload.fromPath");
  if (!fromPath.ok) return fromPath;
  const toPath = requireString(payload.value.toPath, "payload.toPath");
  if (!toPath.ok) return toPath;

  return ok({
    action: "rename_note",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      fromPath: fromPath.value,
      toPath: toPath.value,
    },
  });
}

function validateArchiveNoteAction(input: Record<string, unknown>): Result<ArchiveNoteAction, ValidationError> {
  const payload = requirePayloadObject(input);
  if (!payload.ok) return payload;

  const path = requireString(payload.value.path, "payload.path");
  if (!path.ok) return path;

  return ok({
    action: "archive_note",
    requestId: optionalString(input.requestId),
    vaultId: optionalString(input.vaultId),
    actor: readActor(input.actor),
    payload: {
      path: path.value,
    },
  });
}

function requirePayloadObject(input: Record<string, unknown>): Result<Record<string, unknown>, ValidationError> {
  if (!isPlainObject(input.payload)) {
    return err(new ValidationError("payload must be an object."));
  }

  return ok(input.payload);
}

function optionalFrontmatterMutation(
  input: unknown,
  field: string,
): Result<{ mode: "replace" | "merge"; data: FrontmatterRecord } | undefined, ValidationError> {
  if (input === undefined) {
    return ok(undefined);
  }

  if (!isPlainObject(input)) {
    return err(new ValidationError(`${field} must be an object.`));
  }

  const mode = input.mode;
  if (mode !== "replace" && mode !== "merge") {
    return err(new ValidationError(`${field}.mode must be replace or merge.`));
  }

  if (!isPlainObject(input.data)) {
    return err(new ValidationError(`${field}.data must be an object.`));
  }

  return ok({
    mode,
    data: input.data as FrontmatterRecord,
  });
}

function optionalWriteStrategy(input: unknown): Result<"direct" | "atomic" | undefined, ValidationError> {
  if (input === undefined) {
    return ok(undefined);
  }

  if (input === "direct" || input === "atomic") {
    return ok(input);
  }

  return err(new ValidationError("writeStrategy must be direct or atomic."));
}

function requireString(input: unknown, field: string): Result<string, ValidationError> {
  if (typeof input !== "string" || input.length === 0) {
    return err(new ValidationError(`${field} must be a non-empty string.`));
  }

  return ok(input);
}

function optionalString(input: unknown): string | undefined {
  return typeof input === "string" && input.length > 0 ? input : undefined;
}

function optionalNumber(input: unknown, field: string): Result<number | undefined, ValidationError> {
  if (input === undefined) {
    return ok(undefined);
  }

  if (typeof input !== "number" || Number.isNaN(input)) {
    return err(new ValidationError(`${field} must be a number.`));
  }

  return ok(input);
}

function optionalBoolean(input: unknown): boolean | undefined {
  return typeof input === "boolean" ? input : undefined;
}

function readActor(input: unknown): NoteActionActor | undefined {
  if (!isPlainObject(input)) {
    return undefined;
  }

  const type = input.type;
  const id = input.id;
  if ((type === "agent" || type === "user" || type === "system") && typeof id === "string" && id.length > 0) {
    return { type, id };
  }

  return undefined;
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}
