import path from "node:path";

export const DEFAULT_DATA_DIR = "/data";
export const DEFAULT_VAULT_DIRNAME = "vault";
export const DEFAULT_APP_DIRNAME = "app";
export const DEFAULT_TEMP_DIRNAME = "tmp";

export interface RuntimePathInput {
  dataDir?: string;
  vaultDir?: string;
  appDir?: string;
  tempDir?: string;
}

export interface RuntimePaths {
  dataDir: string;
  vaultDir: string;
  appDir: string;
  tempDir: string;
}

export function resolveRuntimePaths(
  input: RuntimePathInput = {},
  options: { cwd?: string } = {},
): RuntimePaths {
  const cwd = options.cwd ?? process.cwd();
  const dataDir = resolvePath(input.dataDir ?? DEFAULT_DATA_DIR, cwd);

  return {
    dataDir,
    vaultDir: resolvePath(input.vaultDir ?? path.join(dataDir, DEFAULT_VAULT_DIRNAME), cwd),
    appDir: resolvePath(input.appDir ?? path.join(dataDir, DEFAULT_APP_DIRNAME), cwd),
    tempDir: resolvePath(input.tempDir ?? path.join(dataDir, DEFAULT_TEMP_DIRNAME), cwd),
  };
}

function resolvePath(inputPath: string, cwd: string): string {
  return path.normalize(path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath));
}

