export interface VaultLocation {
  rootPath: string;
}

export interface VaultOperationOptions {
  readonly dryRun?: boolean;
}

export const vaultPackage = {
  name: "vault",
  description: "Vault access layer scaffold."
} as const;
