export type ErrorDetails = Readonly<Record<string, unknown>>;

export class ObsidianHubError extends Error {
  readonly code: string;
  readonly details?: ErrorDetails;

  constructor(message: string, options: { code: string; cause?: unknown; details?: ErrorDetails }) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
  }
}

export class ValidationError extends ObsidianHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, { code: "VALIDATION_ERROR", details });
  }
}

export class ConfigurationError extends ObsidianHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, { code: "CONFIGURATION_ERROR", details });
  }
}

export class PathAccessError extends ObsidianHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, { code: "PATH_ACCESS_ERROR", details });
  }
}

export class NotFoundError extends ObsidianHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, { code: "NOT_FOUND", details });
  }
}

export class ConflictError extends ObsidianHubError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, { code: "CONFLICT", details });
  }
}

export function toErrorWithMessage(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unknown error");
}

