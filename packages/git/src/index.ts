export interface GitRepositoryStatus {
  isInitialized: boolean;
  hasChanges: boolean;
}

export const gitPackage = {
  name: "git",
  description: "Git version-layer scaffold."
} as const;
