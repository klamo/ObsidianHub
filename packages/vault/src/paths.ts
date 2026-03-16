import path from "node:path";

import { PathAccessError, ValidationError } from "@obsidianhub/core";

export interface VaultPathResolution {
  inputPath: string;
  normalizedPath: string;
  absolutePath: string;
}

export function normalizeVaultPath(inputPath: string): string {
  if (typeof inputPath !== "string") {
    throw new ValidationError("Vault path must be a string.");
  }

  const trimmedPath = inputPath.trim().replaceAll("\\", "/");
  const withoutLeadingSlash = trimmedPath.replace(/^\/+/, "");
  const normalizedPath = path.posix.normalize(withoutLeadingSlash);

  if (
    trimmedPath.length === 0 ||
    normalizedPath === "." ||
    normalizedPath === "" ||
    normalizedPath.startsWith("../") ||
    normalizedPath === ".." ||
    normalizedPath.includes("\u0000")
  ) {
    throw new PathAccessError("Vault path escapes the mounted vault root.", {
      inputPath,
    });
  }

  return normalizedPath;
}

export function resolveVaultPath(rootPath: string, inputPath: string): VaultPathResolution {
  const absoluteRootPath = path.resolve(rootPath);
  const normalizedPath = normalizeVaultPath(inputPath);
  const absolutePath = path.resolve(absoluteRootPath, normalizedPath);
  const relativeToRoot = path.relative(absoluteRootPath, absolutePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new PathAccessError("Resolved path escapes the mounted vault root.", {
      inputPath,
      normalizedPath,
      rootPath: absoluteRootPath,
    });
  }

  return {
    inputPath,
    normalizedPath,
    absolutePath,
  };
}

