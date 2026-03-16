export type SyncState = "idle" | "syncing" | "conflicted";

export interface SyncEnvelope {
  deviceId: string;
  state: SyncState;
}

export const syncPackage = {
  name: "sync",
  description: "Working-state sync scaffold."
} as const;
