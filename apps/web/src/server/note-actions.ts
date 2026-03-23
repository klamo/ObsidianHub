import path from "node:path";

import { ServerNoteActionExecutor, validateNoteAction } from "@obsidianhub/actions";
import { ValidationError } from "@obsidianhub/core";
import { Vault } from "@obsidianhub/vault";

export async function executeNoteActionRequest(input: unknown) {
  const actionResult = validateNoteAction(input);
  if (!actionResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        action: readActionName(input),
        requestId: readRequestId(input),
        error: formatError(actionResult.error),
      },
    } as const;
  }

  const vaultRootPath = resolveVaultRootPath();
  const vault = new Vault({ rootPath: vaultRootPath });
  const executor = new ServerNoteActionExecutor(vault);
  const executionResult = await executor.execute(actionResult.value);

  if (!executionResult.ok) {
    return {
      status: mapErrorStatus(executionResult.error),
      body: {
        ok: false,
        action: actionResult.value.action,
        requestId: actionResult.value.requestId,
        error: formatError(executionResult.error),
      },
    } as const;
  }

  return {
    status: 200,
    body: {
      ok: true,
      requestId: executionResult.value.requestId,
      action: executionResult.value.action,
      result: executionResult.value.result,
      meta: executionResult.value.meta,
    },
  } as const;
}

function resolveVaultRootPath(): string {
  if (typeof process.env.OBSIDIANHUB_VAULT_DIR === "string" && process.env.OBSIDIANHUB_VAULT_DIR.length > 0) {
    return path.isAbsolute(process.env.OBSIDIANHUB_VAULT_DIR)
      ? process.env.OBSIDIANHUB_VAULT_DIR
      : path.resolve(process.cwd(), process.env.OBSIDIANHUB_VAULT_DIR);
  }

  if (typeof process.env.OBSIDIANHUB_DATA_DIR === "string" && process.env.OBSIDIANHUB_DATA_DIR.length > 0) {
    const dataDir = path.isAbsolute(process.env.OBSIDIANHUB_DATA_DIR)
      ? process.env.OBSIDIANHUB_DATA_DIR
      : path.resolve(process.cwd(), process.env.OBSIDIANHUB_DATA_DIR);

    return path.join(dataDir, "vault");
  }

  return path.resolve(process.cwd(), "data/vault");
}

function readActionName(input: unknown): string | undefined {
  if (!isPlainObject(input) || typeof input.action !== "string") {
    return undefined;
  }

  return input.action;
}

function readRequestId(input: unknown): string | undefined {
  if (!isPlainObject(input) || typeof input.requestId !== "string") {
    return undefined;
  }

  return input.requestId;
}

function formatError(error: { code?: string; message: string; details?: unknown }) {
  return {
    code: error.code ?? "INTERNAL_ERROR",
    message: error.message,
    details: error.details,
  };
}

function mapErrorStatus(error: { code?: string }): number {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "PATH_ACCESS_ERROR":
      return 403;
    default:
      return error instanceof ValidationError ? 400 : 500;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
