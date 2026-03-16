import { mkdir, open, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

import {
  ConflictError,
  NotFoundError,
  PathAccessError,
  type Result,
  ValidationError,
  err,
  ok,
} from "@obsidianhub/core";

import { type VaultPathResolution, resolveVaultPath } from "./paths.js";

export interface VaultLocation {
  rootPath: string;
}

export interface VaultOperationOptions {
  readonly dryRun?: boolean;
}

export interface VaultTextReadOptions {
  encoding?: BufferEncoding;
}

export interface VaultFrontmatterMutation {
  mode: "replace" | "merge";
  data: Record<string, unknown>;
}

export interface VaultWriteStrategy {
  mode?: "direct" | "atomic";
}

export interface VaultTextWriteOptions extends VaultOperationOptions {
  encoding?: BufferEncoding;
  createParents?: boolean;
  overwrite?: boolean;
  expectedMtimeMs?: number;
  frontmatter?: VaultFrontmatterMutation;
  writeStrategy?: VaultWriteStrategy;
}

export interface VaultTextFile {
  path: string;
  absolutePath: string;
  content: string;
  encoding: BufferEncoding;
  mtimeMs: number;
  size: number;
}

export interface VaultWriteReceipt {
  path: string;
  absolutePath: string;
  encoding: BufferEncoding;
  bytesWritten: number;
  created: boolean;
  mtimeMs: number;
}

export class Vault {
  readonly rootPath: string;

  constructor(location: VaultLocation) {
    this.rootPath = path.resolve(location.rootPath);
  }

  normalizePath(inputPath: string): string {
    return resolveVaultPath(this.rootPath, inputPath).normalizedPath;
  }

  async readText(
    inputPath: string,
    options: VaultTextReadOptions = {},
  ): Promise<Result<VaultTextFile, NotFoundError | PathAccessError>> {
    const encoding = options.encoding ?? "utf8";

    try {
      const resolvedPath = await this.resolveExistingPath(inputPath);
      const fileStat = await stat(resolvedPath.absolutePath);

      if (!fileStat.isFile()) {
        return err(
          new NotFoundError("Vault path does not point to a file.", {
            path: resolvedPath.normalizedPath,
          }),
        );
      }

      const content = await readFile(resolvedPath.absolutePath, { encoding });

      return ok({
        path: resolvedPath.normalizedPath,
        absolutePath: resolvedPath.absolutePath,
        content,
        encoding,
        mtimeMs: fileStat.mtimeMs,
        size: fileStat.size,
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof PathAccessError) {
        return err(error);
      }

      throw error;
    }
  }

  async writeText(
    inputPath: string,
    content: string,
    options: VaultTextWriteOptions = {},
  ): Promise<Result<VaultWriteReceipt, ConflictError | NotFoundError | PathAccessError | ValidationError>> {
    const encoding = options.encoding ?? "utf8";
    const createParents = options.createParents ?? true;
    const overwrite = options.overwrite ?? true;

    if (options.frontmatter) {
      return err(
        new ValidationError("Frontmatter mutations are not implemented yet.", {
          path: inputPath,
        }),
      );
    }

    if (options.writeStrategy?.mode === "atomic") {
      return err(
        new ValidationError("Atomic write mode is not implemented yet.", {
          path: inputPath,
        }),
      );
    }

    try {
      const resolvedPath = resolveVaultPath(this.rootPath, inputPath);
      await this.assertParentWithinRoot(resolvedPath.absolutePath);

      const existingStat = await stat(resolvedPath.absolutePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") {
          return null;
        }

        throw error;
      });

      if (!overwrite && existingStat) {
        return err(
          new ConflictError("Vault file already exists.", {
            path: resolvedPath.normalizedPath,
          }),
        );
      }

      if (
        options.expectedMtimeMs !== undefined &&
        existingStat &&
        existingStat.mtimeMs !== options.expectedMtimeMs
      ) {
        return err(
          new ConflictError("Vault file changed since the caller last read it.", {
            path: resolvedPath.normalizedPath,
            expectedMtimeMs: options.expectedMtimeMs,
            actualMtimeMs: existingStat.mtimeMs,
          }),
        );
      }

      if (options.dryRun) {
        return ok({
          path: resolvedPath.normalizedPath,
          absolutePath: resolvedPath.absolutePath,
          encoding,
          bytesWritten: Buffer.byteLength(content, encoding),
          created: !existingStat,
          mtimeMs: existingStat?.mtimeMs ?? 0,
        });
      }

      if (createParents) {
        await mkdir(path.dirname(resolvedPath.absolutePath), { recursive: true });
      }

      const handle = await open(resolvedPath.absolutePath, overwrite ? "w" : "wx");

      try {
        await handle.writeFile(content, { encoding });
      } finally {
        await handle.close();
      }

      const nextStat = await stat(resolvedPath.absolutePath);

      return ok({
        path: resolvedPath.normalizedPath,
        absolutePath: resolvedPath.absolutePath,
        encoding,
        bytesWritten: Buffer.byteLength(content, encoding),
        created: !existingStat,
        mtimeMs: nextStat.mtimeMs,
      });
    } catch (error) {
      if (
        error instanceof ConflictError ||
        error instanceof NotFoundError ||
        error instanceof PathAccessError ||
        error instanceof ValidationError
      ) {
        return err(error);
      }

      if (isErrnoException(error) && error.code === "ENOENT") {
        return err(new NotFoundError("Vault parent directory does not exist.", { path: inputPath }));
      }

      throw error;
    }
  }

  private async resolveExistingPath(inputPath: string): Promise<VaultPathResolution> {
    const resolvedPath = resolveVaultPath(this.rootPath, inputPath);

    await this.assertRealPathWithinRoot(resolvedPath.absolutePath);
    return resolvedPath;
  }

  private async assertParentWithinRoot(targetPath: string): Promise<void> {
    const absoluteParentPath = path.dirname(targetPath);
    const relativeToRoot = path.relative(this.rootPath, absoluteParentPath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new PathAccessError("Vault parent directory escapes the mounted root.", {
        rootPath: this.rootPath,
        targetPath,
      });
    }

    await this.assertRealPathWithinRoot(absoluteParentPath, { allowMissing: true });
  }

  private async assertRealPathWithinRoot(
    targetPath: string,
    options: { allowMissing?: boolean } = {},
  ): Promise<void> {
    const rootRealPath = await realpath(this.rootPath).catch(() => this.rootPath);
    const targetRealPath = await realpath(targetPath).catch((error: NodeJS.ErrnoException) => {
      if (options.allowMissing && error.code === "ENOENT") {
        return null;
      }

      throw error;
    });

    if (!targetRealPath) {
      return;
    }

    const relativeToRoot = path.relative(rootRealPath, targetRealPath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new PathAccessError("Resolved filesystem path escapes the mounted vault root.", {
        rootPath: rootRealPath,
        targetPath,
        resolvedPath: targetRealPath,
      });
    }
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
