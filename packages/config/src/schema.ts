import { ConfigurationError, type Result, err, ok } from "@obsidianhub/core";

import { resolveRuntimePaths, type RuntimePathInput, type RuntimePaths } from "./runtime-paths.js";

export interface ObsidianHubConfigInput {
  runtimePaths?: RuntimePathInput;
}

export interface ObsidianHubConfig {
  runtimePaths: RuntimePaths;
}

export function normalizeConfig(
  input: ObsidianHubConfigInput = {},
  options: { cwd?: string } = {},
): ObsidianHubConfig {
  return {
    runtimePaths: resolveRuntimePaths(input.runtimePaths, options),
  };
}

export function parseConfig(
  input: unknown,
  options: { cwd?: string } = {},
): Result<ObsidianHubConfig, ConfigurationError> {
  if (input === undefined) {
    return ok(normalizeConfig({}, options));
  }

  if (!isPlainObject(input)) {
    return err(new ConfigurationError("Configuration must be an object."));
  }

  const runtimePathsInput = input.runtimePaths;
  if (runtimePathsInput !== undefined && !isPlainObject(runtimePathsInput)) {
    return err(new ConfigurationError("runtimePaths must be an object."));
  }

  const candidate = runtimePathsInput ?? {};
  for (const [key, value] of Object.entries(candidate)) {
    if (value !== undefined && typeof value !== "string") {
      return err(
        new ConfigurationError(`runtimePaths.${key} must be a string.`, {
          key,
          receivedType: typeof value,
        }),
      );
    }
  }

  return ok(
    normalizeConfig(
      {
        runtimePaths: candidate as RuntimePathInput,
      },
      options,
    ),
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
