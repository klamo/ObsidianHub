export interface RuntimePaths {
  dataDir: string;
  vaultDir: string;
}

export interface ObsidianHubConfig {
  runtimePaths: RuntimePaths;
}

export const configPackage = {
  name: "config",
  description: "Configuration scaffold."
} as const;
