import { TRPCError } from "@trpc/server";

export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTEGRATION_ERROR = "INTEGRATION_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CIRCUIT_BREAKER_OPEN = "CIRCUIT_BREAKER_OPEN",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export function createApiError(
  code: ErrorCode,
  message: string,
  details?: unknown,
): TRPCError {
  const trpcCode = mapErrorCodeToTRPC(code);

  return new TRPCError({
    code: trpcCode,
    message,
    cause: details,
  });
}

function mapErrorCodeToTRPC(code: ErrorCode): TRPCError["code"] {
  switch (code) {
    case ErrorCode.BAD_REQUEST:
      return "BAD_REQUEST";
    case ErrorCode.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case ErrorCode.FORBIDDEN:
      return "FORBIDDEN";
    case ErrorCode.NOT_FOUND:
      return "NOT_FOUND";
    case ErrorCode.CONFLICT:
      return "CONFLICT";
    case ErrorCode.VALIDATION_ERROR:
      return "BAD_REQUEST";
    case ErrorCode.TOO_MANY_REQUESTS:
      return "TOO_MANY_REQUESTS";
    case ErrorCode.INTEGRATION_ERROR:
      return "INTERNAL_SERVER_ERROR";
    case ErrorCode.TIMEOUT_ERROR:
      return "INTERNAL_SERVER_ERROR";
    case ErrorCode.CIRCUIT_BREAKER_OPEN:
      return "INTERNAL_SERVER_ERROR";
    case ErrorCode.INTERNAL_SERVER_ERROR:
    case ErrorCode.SERVICE_UNAVAILABLE:
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

export function handleIntegrationError(error: unknown): TRPCError {
  if (error && typeof error === "object" && "code" in error) {
    const err = error as { code: string; message?: string };

    switch (err.code) {
      case "CIRCUIT_BREAKER_OPEN":
        return createApiError(
          ErrorCode.CIRCUIT_BREAKER_OPEN,
          err.message || "Service temporarily unavailable due to failures",
        );
      case "TIMEOUT":
        return createApiError(
          ErrorCode.TIMEOUT_ERROR,
          err.message || "Request timed out",
        );
      case "API_ERROR":
        return createApiError(
          ErrorCode.INTEGRATION_ERROR,
          err.message || "External service error",
          error,
        );
    }
  }

  if (error instanceof Error) {
    return createApiError(
      ErrorCode.INTEGRATION_ERROR,
      error.message,
      error,
    );
  }

  return createApiError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    "Unknown integration error",
  );
}

export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export function createValidationErrorMessage(errors: Array<{ message: string; path?: (string | number)[] }>): string {
  if (errors.length === 1) {
    return errors[0]?.message || "Validation error";
  }
  return `Validation failed: ${errors.map((e) => e.message).join(", ")}`;
}
