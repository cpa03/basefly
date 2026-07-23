/**
 * Centralized Logger
 *
 * A unified logging solution for the Basefly platform. This module provides
 * consistent logging across all packages with support for:
 * - Structured logging with pino
 * - Request context (requestId, userId)
 * - Package identification
 * - Environment-based configuration
 *
 * @module @saasfly/common/logger
 */

import pino, { type Logger } from "pino";

import { IS_DEV, IS_TEST, LOG_LEVEL } from "./config/log-level";

/**
 * Supported package names for logging context
 */
export type PackageName = "api" | "db" | "stripe" | "auth" | "common";

/**
 * Extended metadata for log entries
 */
export interface LogMetadata {
  /** Request identifier for tracing */
  requestId?: string;
  /** User identifier for audit trails */
  userId?: string;
  /** Additional context */
  [key: string]: unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Package name for context */
  package: PackageName;
  /** Override log level (defaults to env LOG_LEVEL) */
  level?: string;
  /** Enable pretty printing in development */
  pretty?: boolean;
}

/**
 * Sensitive field name patterns that should be redacted from logs.
 * Any metadata key matching these patterns (case-insensitive partial match)
 * will have its value replaced with "[REDACTED]" before logging.
 *
 * This prevents accidental leakage of secrets, tokens, and PII through logs.
 *
 *
 * @module @saasfly/common/logger
 */
export const SENSITIVE_FIELD_PATTERNS = [
  "secret",
  "token",
  "password",
  "credential",
  "api_key",
  "authorization",
  "set-cookie",
  "cookie",
  "session",
  "private_key",
  "privatekey",
  // HTTP headers may contain Stripe-Signature, Authorization, Set-Cookie, etc.
  // StripeError objects include a `headers` property with raw request/response headers.
  "header",
  // Signature values (e.g. Stripe-Signature) are computed from webhook secrets
  // and could aid brute-force attacks if leaked.
  "signature",
] as const;

/**
 * Safe error serializer for pino that strips known sensitive fields
 * from nested error properties before serialization.
 *
 * Error objects from Stripe, Clerk, and other services can contain
 * nested objects (raw responses, headers, config) that may include
 * API keys, tokens, or other sensitive data at any depth.
 *
 * This serializer:
 * 1. Extracts the standard error properties (message, name, stack)
 * 2. Recursively sanitizes custom properties by redacting sensitive fields
 * 3. Limits recursion depth to prevent stack overflow on circular objects
 *
 * @param err - The error object to serialize
 * @returns A safe error object with sensitive fields redacted
 */
export function safeSerializeError(err: unknown): Record<string, unknown> {
  if (err == null) {
    return { message: "Unknown error" };
  }
  if (typeof err !== "object") {
    return { message: typeof err === "string" ? err : "Non-object error" };
  }

  const MAX_DEPTH = 5;
  const error = err as Record<string, unknown>;
  const errorMessage =
    typeof error.message === "string" ? error.message : "Unknown error";

  // Always extract standard error properties
  const result: Record<string, unknown> = {
    message: errorMessage,
    name: typeof error.name === "string" ? error.name : "Error",
  };

  // Include stack trace (controlled by pino config in production)
  if (typeof error.stack === "string") {
    result.stack = error.stack;
  }

  // Recursively sanitize custom properties
  function sanitizeValue(value: unknown, depth: number): unknown {
    if (depth > MAX_DEPTH) {
      return "[MAX_DEPTH]";
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, depth + 1));
    }

    if (value && typeof value === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(
        value as Record<string, unknown>,
      )) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELD_PATTERNS.some((pattern) =>
          lowerKey.includes(pattern),
        );
        if (isSensitive) {
          sanitized[key] = "[REDACTED]";
        } else if (key === "stack" || key === "message" || key === "name") {
          // Skip - already handled above
          continue;
        } else {
          sanitized[key] = sanitizeValue(val, depth + 1);
        }
      }
      return sanitized;
    }

    return value;
  }

  // Sanitize all custom properties on the error
  for (const [key, value] of Object.entries(error)) {
    if (key === "message" || key === "name" || key === "stack") {
      continue;
    }
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELD_PATTERNS.some((pattern) =>
      lowerKey.includes(pattern),
    );
    if (isSensitive) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizeValue(value, 0);
    }
  }

  return result;
}

/**
 * Build pino redact configuration from sensitive field patterns.
 * Generates top-level, one-level, and deep-nested paths for each pattern.
 *
 * The three levels ensure:
 * - `secret` catches top-level keys
 * - `*.secret` catches one-level nested keys (e.g., `error.secret`)
 * - `**.secret` catches deeply nested keys (e.g., `error.raw.headers.authorization`)
 */
export function buildRedactConfig(): { paths: string[]; censor: string } {
  const paths: string[] = [];
  for (const pattern of SENSITIVE_FIELD_PATTERNS) {
    // Match at top level
    paths.push(pattern);
    // Match one level deep (e.g., error.secret, meta.token)
    paths.push(`*.${pattern}`);
    // Match any depth (e.g., error.raw.headers.authorization)
    paths.push(`**.${pattern}`);
  }
  return { paths, censor: "[REDACTED]" };
}

/**
 * Creates a configured logger instance for a specific package
 *
 * @param config - Logger configuration
 * @returns Configured pino logger instance
 *
 * @example
 * ```typescript
 * import { createLogger } from "@saasfly/common/logger";
 *
 * const logger = createLogger({ package: "api" });
 * logger.info({ requestId: "req-123" }, "Processing request");
 * ```
 *
 * Security: All loggers created via this function automatically redact
 * sensitive fields (secrets, tokens, passwords, etc.) before output.
 */
export function createLogger(config: LoggerConfig): Logger {
  const level = config.level ?? LOG_LEVEL;
  const shouldPretty = config.pretty ?? (IS_DEV && !IS_TEST);

  return pino({
    level: isTest() ? "silent" : level,
    base: {
      package: config.package,
    },
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    serializers: {
      error: safeSerializeError,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: buildRedactConfig(),
    transport: shouldPretty
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "package,pid,hostname",
          },
        }
      : undefined,
  });
}

/**
 * Check if running in test environment
 */
function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Default logger instance using "common" package context
 * Use this for general logging when package-specific logger is not needed
 */
export const logger = createLogger({ package: "common" });

/**
 * Convenience logger creators for each package
 * These provide type-safe loggers with package context pre-configured
 */
export const apiLogger = createLogger({ package: "api" });
export const dbLogger = createLogger({ package: "db" });
export const stripeLogger = createLogger({ package: "stripe" });
export const authLogger = createLogger({ package: "auth" });

/**
 * Type-safe logging interface that all packages should use
 * This provides consistency across the codebase
 */
export interface BaseLogger {
  debug(message: string, data?: LogMetadata): void;
  info(message: string, data?: LogMetadata): void;
  warn(message: string, data?: LogMetadata): void;
  error(message: string, error?: unknown, data?: LogMetadata): void;
}

/**
 * Redact sensitive fields from metadata before logging.
 * This is a case-insensitive check that catches variants like
 * `Secret`, `API_KEY`, `StripeToken` that pino's case-sensitive
 * redact config would miss.
 *
 * @param meta - Metadata object to redact in-place
 * @returns The same object with sensitive field values replaced by "[REDACTED]"
 */
function redactSensitiveFields(
  meta: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(meta)) {
    const lowerKey = key.toLowerCase();
    if (
      SENSITIVE_FIELD_PATTERNS.some((pattern) => lowerKey.includes(pattern))
    ) {
      meta[key] = "[REDACTED]";
    }
  }
  return meta;
}

/**
 * Creates a type-safe logger wrapper around a pino logger
 *
 * @param pinoLogger - The pino logger instance
 * @returns Logger interface conforming to BaseLogger
 */
export function createLoggerWrapper(pinoLogger: Logger): BaseLogger {
  return {
    debug(message: string, data?: LogMetadata): void {
      pinoLogger.debug(data ? redactSensitiveFields({ ...data }) : {}, message);
    },
    info(message: string, data?: LogMetadata): void {
      pinoLogger.info(data ? redactSensitiveFields({ ...data }) : {}, message);
    },
    warn(message: string, data?: LogMetadata): void {
      pinoLogger.warn(data ? redactSensitiveFields({ ...data }) : {}, message);
    },
    error(message: string, error?: unknown, data?: LogMetadata): void {
      pinoLogger.error(
        { error, ...(data ? redactSensitiveFields({ ...data }) : {}) },
        message,
      );
    },
  };
}
