/**
 * Tests for Error Handling Utilities
 */

import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

import {
  createApiError,
  createValidationErrorMessage,
  ErrorCode,
  handleIntegrationError,
  InvalidRequestIdError,
} from "./errors";

describe("InvalidRequestIdError", () => {
  it("should create an error with the default message", () => {
    const error = new InvalidRequestIdError("abc-123");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidRequestIdError");
    expect(error.message).toBe("Invalid request ID: abc-123");
    expect(error.requestId).toBe("abc-123");
  });

  it("should create an error with a custom message", () => {
    const error = new InvalidRequestIdError("xyz", "Custom message");

    expect(error.message).toBe("Custom message");
    expect(error.requestId).toBe("xyz");
  });

  it("should preserve stack trace", () => {
    const error = new InvalidRequestIdError("test-id");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("InvalidRequestIdError");
  });
});

describe("ErrorCode enum", () => {
  it("should have all expected error codes", () => {
    expect(ErrorCode.BAD_REQUEST).toBe("BAD_REQUEST");
    expect(ErrorCode.UNAUTHORIZED).toBe("UNAUTHORIZED");
    expect(ErrorCode.FORBIDDEN).toBe("FORBIDDEN");
    expect(ErrorCode.NOT_FOUND).toBe("NOT_FOUND");
    expect(ErrorCode.CONFLICT).toBe("CONFLICT");
    expect(ErrorCode.INTERNAL_SERVER_ERROR).toBe("INTERNAL_SERVER_ERROR");
    expect(ErrorCode.SERVICE_UNAVAILABLE).toBe("SERVICE_UNAVAILABLE");
    expect(ErrorCode.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ErrorCode.INTEGRATION_ERROR).toBe("INTEGRATION_ERROR");
    expect(ErrorCode.TIMEOUT_ERROR).toBe("TIMEOUT_ERROR");
    expect(ErrorCode.CIRCUIT_BREAKER_OPEN).toBe("CIRCUIT_BREAKER_OPEN");
    expect(ErrorCode.TOO_MANY_REQUESTS).toBe("TOO_MANY_REQUESTS");
  });
});

describe("createApiError", () => {
  it("should create a BAD_REQUEST TRPCError", () => {
    const error = createApiError(ErrorCode.BAD_REQUEST, "Invalid input");

    expect(error).toBeInstanceOf(TRPCError);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.message).toBe("Invalid input");
  });

  it("should create an UNAUTHORIZED TRPCError", () => {
    const error = createApiError(ErrorCode.UNAUTHORIZED, "Not logged in");

    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("should create a FORBIDDEN TRPCError", () => {
    const error = createApiError(ErrorCode.FORBIDDEN, "Access denied");

    expect(error.code).toBe("FORBIDDEN");
  });

  it("should create a NOT_FOUND TRPCError", () => {
    const error = createApiError(ErrorCode.NOT_FOUND, "Resource not found");

    expect(error.code).toBe("NOT_FOUND");
  });

  it("should create a CONFLICT TRPCError", () => {
    const error = createApiError(ErrorCode.CONFLICT, "Already exists");

    expect(error.code).toBe("CONFLICT");
  });

  it("should create a TOO_MANY_REQUESTS TRPCError", () => {
    const error = createApiError(
      ErrorCode.TOO_MANY_REQUESTS,
      "Rate limit exceeded",
    );

    expect(error.code).toBe("TOO_MANY_REQUESTS");
  });

  it("should create an INTERNAL_SERVER_ERROR for integration errors", () => {
    const error = createApiError(
      ErrorCode.INTEGRATION_ERROR,
      "Integration failed",
    );

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should create an INTERNAL_SERVER_ERROR for timeout errors", () => {
    const error = createApiError(ErrorCode.TIMEOUT_ERROR, "Timed out");

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should create an INTERNAL_SERVER_ERROR for circuit breaker open", () => {
    const error = createApiError(
      ErrorCode.CIRCUIT_BREAKER_OPEN,
      "Circuit breaker open",
    );

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should create an INTERNAL_SERVER_ERROR for generic internal errors", () => {
    const error = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "Something went wrong",
    );

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should create a BAD_REQUEST for validation errors", () => {
    const error = createApiError(
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
    );

    expect(error.code).toBe("BAD_REQUEST");
  });

  it("should default to INTERNAL_SERVER_ERROR for unrecognized codes", () => {
    const error = createApiError(
      "UNKNOWN_CODE" as ErrorCode,
      "Unrecognized error",
    );

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should include details in the error cause", () => {
    const details = { field: "email", reason: "already taken" };
    const error = createApiError(
      ErrorCode.CONFLICT,
      "Duplicate entry",
      details,
    );

    expect(error.cause).toBeDefined();
    // TRPCError wraps cause in UnknownCauseError, check properties
    expect(error.cause).toMatchObject({ field: "email", reason: "already taken" });
  });
});

describe("handleIntegrationError", () => {
  it("should handle CIRCUIT_BREAKER_OPEN errors", () => {
    const error = { code: "CIRCUIT_BREAKER_OPEN", message: "Service busy" };
    const result = handleIntegrationError(error);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    // When a custom message is provided, it is used directly
    expect(result.message).toBe("Service busy");
  });

  it("should handle CIRCUIT_BREAKER_OPEN with default message", () => {
    const error = { code: "CIRCUIT_BREAKER_OPEN" };
    const result = handleIntegrationError(error);

    expect(result.message).toBe(
      "Service temporarily unavailable due to failures",
    );
  });

  it("should handle TIMEOUT errors", () => {
    const error = { code: "TIMEOUT", message: "Request took too long" };
    const result = handleIntegrationError(error);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Request took too long");
  });

  it("should handle TIMEOUT with default message", () => {
    const error = { code: "TIMEOUT" };
    const result = handleIntegrationError(error);

    expect(result.message).toBe("Request timed out");
  });

  it("should handle API_ERROR errors", () => {
    const error = {
      code: "API_ERROR",
      message: "External service returned 500",
    };
    const result = handleIntegrationError(error);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("External service returned 500");
    // TRPCError wraps cause; verify error is included
    expect(result.cause).toBeDefined();
    expect(result.cause).toMatchObject(error);
  });

  it("should handle API_ERROR with default message", () => {
    const error = { code: "API_ERROR" };
    const result = handleIntegrationError(error);

    expect(result.message).toBe("External service error");
  });

  it("should handle standard Error instances", () => {
    const error = new Error("Database connection failed");
    const result = handleIntegrationError(error);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Database connection failed");
    expect(result.cause).toBe(error);
  });

  it("should handle unknown error types gracefully", () => {
    const result = handleIntegrationError("some string error");

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Unknown integration error");
  });

  it("should handle null errors gracefully", () => {
    const result = handleIntegrationError(null);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Unknown integration error");
  });

  it("should handle undefined errors gracefully", () => {
    const result = handleIntegrationError(undefined);

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Unknown integration error");
  });

  it("should handle errors without code or message property", () => {
    const result = handleIntegrationError({ foo: "bar" });

    expect(result).toBeInstanceOf(TRPCError);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Unknown integration error");
  });
});

describe("createValidationErrorMessage", () => {
  it("should return default message for empty errors", () => {
    const message = createValidationErrorMessage([]);

    expect(message).toBe("Validation error");
  });

  it("should return the single error message directly", () => {
    const message = createValidationErrorMessage([
      { message: "Email is required", path: ["email"] },
    ]);

    expect(message).toBe("Email is required");
  });

  it("should handle single error without a path", () => {
    const message = createValidationErrorMessage([
      { message: "Invalid input" },
    ]);

    expect(message).toBe("Invalid input");
  });

  it("should join multiple error messages with comma", () => {
    const message = createValidationErrorMessage([
      { message: "Email is required", path: ["email"] },
      { message: "Password is too short", path: ["password"] },
    ]);

    expect(message).toBe(
      "Validation failed: Email is required, Password is too short",
    );
  });

  it("should join three or more error messages", () => {
    const message = createValidationErrorMessage([
      { message: "Name is required" },
      { message: "Email is invalid" },
      { message: "Age must be positive" },
    ]);

    expect(message).toBe(
      "Validation failed: Name is required, Email is invalid, Age must be positive",
    );
  });
});
