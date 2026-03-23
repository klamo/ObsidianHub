export * from "./note-actions.js";
export * from "./note-action-schemas.js";
export * from "./server-note-action-executor.js";

export const actionsPackage = {
  name: "actions",
  description: "Action schemas and server executors for ObsidianHub."
} as const;
