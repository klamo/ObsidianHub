export const OBSIDIANHUB_APP_NAME = "ObsidianHub";

export type PackageName =
  | "core"
  | "vault"
  | "sync"
  | "git"
  | "search"
  | "config";

export interface PackageDescriptor {
  name: PackageName;
  description: string;
}

export interface HealthcheckResult {
  ok: boolean;
  scope: string;
}

export type TextEncoding = BufferEncoding;

