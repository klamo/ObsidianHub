import {
  copyFile,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  stat,
  unlink,
} from "node:fs/promises";
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

import { resolveVaultPath, type VaultPathResolution } from "./paths.js";
import {
  applyFrontmatterMutation,
  splitFrontmatterDocument,
  type FrontmatterRecord,
  type VaultDocumentParts,
} from "./frontmatter.js";

export interface VaultLocation {
  rootPath: string;
}

export interface VaultOperationOptions {
  readonly dryRun?: boolean;
}

export interface VaultTextReadOptions {
  encoding?: BufferEncoding;
}

export interface VaultNoteReadResult extends VaultTextFile {
  document: VaultDocumentParts;
}

export interface VaultFrontmatterMutation {
  mode: "replace" | "merge";
  data: FrontmatterRecord;
}

export interface VaultWriteStrategy {
  mode?: "direct" | "atomic";
}

export interface VaultBackupOptions {
  enabled?: boolean;
  directory?: string;
  suffix?: string;
}

export interface VaultTextWriteOptions extends VaultOperationOptions {
  encoding?: BufferEncoding;
  createParents?: boolean;
  overwrite?: boolean;
  expectedMtimeMs?: number;
  frontmatter?: VaultFrontmatterMutation;
  writeStrategy?: VaultWriteStrategy;
  backup?: VaultBackupOptions;
}

export interface VaultFrontmatterUpdateOptions extends VaultOperationOptions {
  encoding?: BufferEncoding;
  writeStrategy?: VaultWriteStrategy;
  backup?: VaultBackupOptions;
  expectedMtimeMs?: number;
}

export interface VaultCreateNoteOptions extends VaultOperationOptions {
  encoding?: BufferEncoding;
  overwrite?: boolean;
  frontmatter?: VaultFrontmatterMutation;
  writeStrategy?: VaultWriteStrategy;
  backup?: VaultBackupOptions;
}

export interface VaultUpdateNoteBodyOptions extends VaultOperationOptions {
  encoding?: BufferEncoding;
  expectedMtimeMs?: number;
  writeStrategy?: VaultWriteStrategy;
  backup?: VaultBackupOptions;
}

export interface VaultRenameNoteOptions extends VaultOperationOptions {
  overwrite?: boolean;
  createParents?: boolean;
}

export interface VaultArchiveNoteOptions extends VaultOperationOptions {
  archiveDirectory?: string;
  suffix?: string;
  createParents?: boolean;
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
  backup?: VaultBackupReceipt;
}

export interface VaultBackupReceipt {
  path: string;
  absolutePath: string;
  bytesCopied: number;
}

export interface VaultMoveReceipt {
  fromPath: string;
  fromAbsolutePath: string;
  toPath: string;
  toAbsolutePath: string;
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

  async readNote(
    inputPath: string,
    options: VaultTextReadOptions = {},
  ): Promise<Result<VaultNoteReadResult, NotFoundError | PathAccessError>> {
    const readResult = await this.readText(inputPath, options);
    if (!readResult.ok) {
      return readResult;
    }

    return ok({
      ...readResult.value,
      document: splitFrontmatterDocument(readResult.value.content),
    });
  }

  async createNote(
    inputPath: string,
    content: string,
    options: VaultCreateNoteOptions = {},
  ): Promise<Result<VaultWriteReceipt, ConflictError | NotFoundError | PathAccessError | ValidationError>> {
    return this.writeText(inputPath, content, {
      encoding: options.encoding,
      dryRun: options.dryRun,
      overwrite: options.overwrite ?? false,
      frontmatter: options.frontmatter,
      writeStrategy: options.writeStrategy,
      backup: options.backup,
    });
  }

  async updateFrontmatter(
    inputPath: string,
    mutation: VaultFrontmatterMutation,
    options: VaultFrontmatterUpdateOptions = {},
  ): Promise<Result<VaultWriteReceipt, ConflictError | NotFoundError | PathAccessError | ValidationError>> {
    const noteResult = await this.readNote(inputPath, { encoding: options.encoding });
    if (!noteResult.ok) {
      return noteResult;
    }

    return this.writeText(inputPath, noteResult.value.content, {
      encoding: options.encoding,
      dryRun: options.dryRun,
      overwrite: true,
      expectedMtimeMs: options.expectedMtimeMs ?? noteResult.value.mtimeMs,
      frontmatter: mutation,
      writeStrategy: options.writeStrategy,
      backup: options.backup,
    });
  }

  async updateNoteBody(
    inputPath: string,
    body: string,
    options: VaultUpdateNoteBodyOptions = {},
  ): Promise<Result<VaultWriteReceipt, ConflictError | NotFoundError | PathAccessError | ValidationError>> {
    const noteResult = await this.readNote(inputPath, { encoding: options.encoding });
    if (!noteResult.ok) {
      return noteResult;
    }

    const nextContent = `${noteResult.value.document.frontmatter?.raw ? `${noteResult.value.document.frontmatter.raw}\n` : ""}${body}`;

    return this.writeText(inputPath, nextContent, {
      encoding: options.encoding,
      dryRun: options.dryRun,
      overwrite: true,
      expectedMtimeMs: options.expectedMtimeMs ?? noteResult.value.mtimeMs,
      writeStrategy: options.writeStrategy,
      backup: options.backup,
    });
  }

  async renameNote(
    fromPath: string,
    toPath: string,
    options: VaultRenameNoteOptions = {},
  ): Promise<Result<VaultMoveReceipt, ConflictError | NotFoundError | PathAccessError>> {
    try {
      const fromResolvedPath = await this.resolveExistingPath(fromPath);
      const toResolvedPath = resolveVaultPath(this.rootPath, toPath);

      await this.assertParentWithinRoot(toResolvedPath.absolutePath);

      const fromStat = await stat(fromResolvedPath.absolutePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") {
          return null;
        }

        throw error;
      });

      if (!fromStat || !fromStat.isFile()) {
        return err(new NotFoundError("Vault path does not point to a file.", { path: fromResolvedPath.normalizedPath }));
      }

      const targetStat = await this.readOptionalStat(toResolvedPath.absolutePath);
      if (targetStat && options.overwrite !== true) {
        return err(new ConflictError("Vault target file already exists.", { path: toResolvedPath.normalizedPath }));
      }

      if (options.dryRun) {
        return ok({
          fromPath: fromResolvedPath.normalizedPath,
          fromAbsolutePath: fromResolvedPath.absolutePath,
          toPath: toResolvedPath.normalizedPath,
          toAbsolutePath: toResolvedPath.absolutePath,
          mtimeMs: fromStat.mtimeMs,
        });
      }

      if (options.createParents ?? true) {
        await mkdir(path.dirname(toResolvedPath.absolutePath), { recursive: true });
      }

      await rename(fromResolvedPath.absolutePath, toResolvedPath.absolutePath);
      const nextStat = await stat(toResolvedPath.absolutePath);

      return ok({
        fromPath: fromResolvedPath.normalizedPath,
        fromAbsolutePath: fromResolvedPath.absolutePath,
        toPath: toResolvedPath.normalizedPath,
        toAbsolutePath: toResolvedPath.absolutePath,
        mtimeMs: nextStat.mtimeMs,
      });
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError || error instanceof PathAccessError) {
        return err(error);
      }

      if (isErrnoException(error) && error.code === "ENOENT") {
        return err(new NotFoundError("Vault parent directory does not exist.", { path: toPath }));
      }

      throw error;
    }
  }

  async archiveNote(
    inputPath: string,
    options: VaultArchiveNoteOptions = {},
  ): Promise<Result<VaultMoveReceipt, ConflictError | NotFoundError | PathAccessError>> {
    const resolvedPath = resolveVaultPath(this.rootPath, inputPath);
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const archiveRoot = options.archiveDirectory ?? ".obsidianhub/archive";
    const suffix = options.suffix ?? ".archived";
    const archivePath = `${archiveRoot}/${resolvedPath.normalizedPath}.${timestamp}${suffix}`;

    return this.renameNote(inputPath, archivePath, {
      dryRun: options.dryRun,
      overwrite: false,
      createParents: options.createParents,
    });
  }

  async writeText(
    inputPath: string,
    content: string,
    options: VaultTextWriteOptions = {},
  ): Promise<Result<VaultWriteReceipt, ConflictError | NotFoundError | PathAccessError | ValidationError>> {
    const encoding = options.encoding ?? "utf8";
    const createParents = options.createParents ?? true;
    const overwrite = options.overwrite ?? true;
    const writeMode = options.writeStrategy?.mode ?? "direct";

    if (writeMode !== "direct" && writeMode !== "atomic") {
      return err(new ValidationError("Unsupported vault write strategy.", { path: inputPath }));
    }

    try {
      const resolvedPath = resolveVaultPath(this.rootPath, inputPath);
      await this.assertParentWithinRoot(resolvedPath.absolutePath);

      const existingStat = await this.readOptionalStat(resolvedPath.absolutePath);

      const preflightError = this.validateWritePreconditions({
        normalizedPath: resolvedPath.normalizedPath,
        existingStat,
        overwrite,
        expectedMtimeMs: options.expectedMtimeMs,
      });

      if (preflightError) {
        return err(preflightError);
      }

      const nextContent = options.frontmatter
        ? this.applyFrontmatterMutation(content, options.frontmatter, resolvedPath.normalizedPath)
        : content;

      if (options.dryRun) {
        const backup = await this.planBackup(resolvedPath, existingStat?.size ?? 0, options.backup, {
          onlyIfExists: !!existingStat,
        });

        return ok({
          path: resolvedPath.normalizedPath,
          absolutePath: resolvedPath.absolutePath,
          encoding,
          bytesWritten: Buffer.byteLength(nextContent, encoding),
          created: !existingStat,
          mtimeMs: existingStat?.mtimeMs ?? 0,
          backup,
        });
      }

      if (createParents) {
        await mkdir(path.dirname(resolvedPath.absolutePath), { recursive: true });
      }

      const backup = await this.createBackupIfNeeded(resolvedPath, existingStat?.size ?? 0, options.backup);

      if (writeMode === "atomic") {
        await this.writeFileAtomic({
          absolutePath: resolvedPath.absolutePath,
          normalizedPath: resolvedPath.normalizedPath,
          content: nextContent,
          encoding,
          overwrite,
          expectedMtimeMs: options.expectedMtimeMs,
          baselineStat: existingStat,
        });
      } else {
        await this.writeFileDirect(resolvedPath.absolutePath, nextContent, encoding, overwrite);
      }

      const nextStat = await stat(resolvedPath.absolutePath);

      return ok({
        path: resolvedPath.normalizedPath,
        absolutePath: resolvedPath.absolutePath,
        encoding,
        bytesWritten: Buffer.byteLength(nextContent, encoding),
        created: !existingStat,
        mtimeMs: nextStat.mtimeMs,
        backup,
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

  private validateWritePreconditions(params: {
    normalizedPath: string;
    existingStat: Awaited<ReturnType<Vault["readOptionalStat"]>>;
    overwrite: boolean;
    expectedMtimeMs?: number;
  }): ConflictError | undefined {
    const { normalizedPath, existingStat, overwrite, expectedMtimeMs } = params;

    if (!overwrite && existingStat) {
      return new ConflictError("Vault file already exists.", {
        path: normalizedPath,
      });
    }

    if (expectedMtimeMs !== undefined) {
      if (!existingStat) {
        return new ConflictError("Vault file no longer exists at write time.", {
          path: normalizedPath,
          expectedMtimeMs,
          actualMtimeMs: null,
        });
      }

      if (existingStat.mtimeMs !== expectedMtimeMs) {
        return new ConflictError("Vault file changed since the caller last read it.", {
          path: normalizedPath,
          expectedMtimeMs,
          actualMtimeMs: existingStat.mtimeMs,
        });
      }
    }

    return undefined;
  }

  private applyFrontmatterMutation(
    content: string,
    mutation: VaultFrontmatterMutation,
    normalizedPath: string,
  ): string {
    try {
      return applyFrontmatterMutation(content, mutation);
    } catch (error) {
      throw new ValidationError("Failed to apply frontmatter mutation.", {
        path: normalizedPath,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async writeFileDirect(
    absolutePath: string,
    content: string,
    encoding: BufferEncoding,
    overwrite: boolean,
  ): Promise<void> {
    const handle = await open(absolutePath, overwrite ? "w" : "wx");

    try {
      await handle.writeFile(content, { encoding });
    } finally {
      await handle.close();
    }
  }

  private async writeFileAtomic(params: {
    absolutePath: string;
    normalizedPath: string;
    content: string;
    encoding: BufferEncoding;
    overwrite: boolean;
    expectedMtimeMs?: number;
    baselineStat: Awaited<ReturnType<Vault["readOptionalStat"]>>;
  }): Promise<void> {
    const {
      absolutePath,
      normalizedPath,
      content,
      encoding,
      overwrite,
      expectedMtimeMs,
      baselineStat,
    } = params;

    const directoryPath = path.dirname(absolutePath);
    const tempPath = path.join(
      directoryPath,
      `.obsidianhub-tmp-${path.basename(absolutePath)}-${process.pid}-${Date.now()}`,
    );

    await this.writeFileDirect(tempPath, content, encoding, false);

    try {
      const latestStat = await this.readOptionalStat(absolutePath);
      const conflict = this.validateAtomicFinalPreconditions({
        normalizedPath,
        overwrite,
        expectedMtimeMs,
        baselineStat,
        latestStat,
      });

      if (conflict) {
        throw conflict;
      }

      await rename(tempPath, absolutePath);
    } catch (error) {
      await unlink(tempPath).catch(() => undefined);
      throw error;
    }
  }

  private validateAtomicFinalPreconditions(params: {
    normalizedPath: string;
    overwrite: boolean;
    expectedMtimeMs?: number;
    baselineStat: Awaited<ReturnType<Vault["readOptionalStat"]>>;
    latestStat: Awaited<ReturnType<Vault["readOptionalStat"]>>;
  }): ConflictError | undefined {
    const { normalizedPath, overwrite, expectedMtimeMs, baselineStat, latestStat } = params;

    if (!overwrite && latestStat) {
      return new ConflictError("Vault file already exists.", {
        path: normalizedPath,
      });
    }

    if (expectedMtimeMs !== undefined) {
      if (!latestStat) {
        return new ConflictError("Vault file no longer exists at write time.", {
          path: normalizedPath,
          expectedMtimeMs,
          actualMtimeMs: null,
        });
      }

      if (latestStat.mtimeMs !== expectedMtimeMs) {
        return new ConflictError("Vault file changed during atomic write preparation.", {
          path: normalizedPath,
          expectedMtimeMs,
          actualMtimeMs: latestStat.mtimeMs,
        });
      }

      return undefined;
    }

    const baselineMtimeMs = baselineStat?.mtimeMs ?? null;
    const latestMtimeMs = latestStat?.mtimeMs ?? null;

    if (baselineMtimeMs !== latestMtimeMs) {
      return new ConflictError("Vault file changed during atomic write preparation.", {
        path: normalizedPath,
        baselineMtimeMs,
        latestMtimeMs,
      });
    }

    return undefined;
  }

  private async readOptionalStat(targetPath: string) {
    return stat(targetPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return null;
      }

      throw error;
    });
  }

  private async resolveExistingPath(inputPath: string): Promise<VaultPathResolution> {
    const resolvedPath = resolveVaultPath(this.rootPath, inputPath);

    await this.assertRealPathWithinRoot(resolvedPath.absolutePath);
    return resolvedPath;
  }

  private async createBackupIfNeeded(
    resolvedPath: VaultPathResolution,
    bytesCopied: number,
    options: VaultBackupOptions | undefined,
  ): Promise<VaultBackupReceipt | undefined> {
    const backup = await this.planBackup(resolvedPath, bytesCopied, options, { onlyIfExists: true });

    if (!backup) {
      return undefined;
    }

    await mkdir(path.dirname(backup.absolutePath), { recursive: true });
    await copyFile(resolvedPath.absolutePath, backup.absolutePath);
    return backup;
  }

  private async planBackup(
    resolvedPath: VaultPathResolution,
    bytesCopied: number,
    options: VaultBackupOptions | undefined,
    context: { onlyIfExists: boolean },
  ): Promise<VaultBackupReceipt | undefined> {
    if (options?.enabled !== true || !context.onlyIfExists) {
      return undefined;
    }

    const backupRoot = resolveVaultPath(this.rootPath, options?.directory ?? ".obsidianhub/backups");
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const suffix = options?.suffix ?? ".bak";
    const backupPath = `${backupRoot.normalizedPath}/${resolvedPath.normalizedPath}.${timestamp}${suffix}`;
    const resolvedBackupPath = resolveVaultPath(this.rootPath, backupPath);

    await this.assertParentWithinRoot(resolvedBackupPath.absolutePath);

    return {
      path: resolvedBackupPath.normalizedPath,
      absolutePath: resolvedBackupPath.absolutePath,
      bytesCopied,
    };
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
