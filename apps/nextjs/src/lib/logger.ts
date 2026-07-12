/* eslint-disable no-console */
/**
 * Simple JSON logger with request ID support for distributed tracing
 * and built-in sensitive field redaction.
 *
 * Logs are disabled in production to avoid console noise (debug/info/warn).
 * Error logs are always active for production monitoring.
 *
 * Features:
 * - ISO 8601 timestamps for all log entries
 * - Request ID support for distributed tracing
 * - Debug level for development (disabled in production)
 * - Automatic redaction of known sensitive fields
 *
 * @example
 * ```ts
 * import { logger } from "~/lib/logger";
 *
 * logger.info("Processing request", { requestId: "uuid" });
 * logger.error("Operation failed", error, { requestId: "uuid" });
 * logger.debug("Debug info", { userId: "123" }); // Only logs in development
 * ```
 */

/**
 * Field name patterns that indicate sensitive data.
 * Any metadata key matching these patterns (case-insensitive partial match)
 * will have its value redacted to "[REDACTED]" before logging.
 */
const SENSITIVE_FIELD_PATTERNS = [
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
] as const;

/**
 * Recursively sanitize a value by redacting sensitive fields at any depth.
 * Error objects from Stripe, Clerk, and other services can contain
 * nested objects (raw responses, headers, config) that may include
 * API keys, tokens, or other sensitive data.
 *
 * @param value - Value to sanitize
 * @param depth - Current recursion depth (prevents stack overflow)
 * @returns Sanitized value with sensitive fields redacted
 */
function sanitizeValue(value: unknown, depth = 0): unknown {
  const MAX_DEPTH = 5;
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
        sanitized[key] = val;
      } else {
        sanitized[key] = sanitizeValue(val, depth + 1);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Safely serialize an error object for logging, stripping sensitive fields
 * from nested properties while preserving useful debugging information
 * like message, name, and stack trace.
 *
 * @param err - Error or unknown value to sanitize
 * @returns Safe error object with sensitive fields redacted
 */
function safeError(err: unknown): Record<string, unknown> {
  if (err == null) {
    return { message: "Unknown error" };
  }
  if (typeof err !== "object") {
    return { message: typeof err === "string" ? err : "Non-object error" };
  }

  const error = err as Record<string, unknown>;
  const errorMessage =
    typeof error.message === "string" ? error.message : "Unknown error";

  return {
    message: errorMessage,
    name: typeof error.name === "string" ? error.name : "Error",
    stack: typeof error.stack === "string" ? error.stack : undefined,
    ...sanitizeValue(error, 0),
  } as Record<string, unknown>;
}

/**
 * Redact sensitive fields from a metadata object before logging.
 * Mutates and returns the same object for performance.
 *
 * @param meta - Metadata object to redact in-place
 * @returns The same object with sensitive field values replaced
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

const isProduction = process.env.NODE_ENV === "production";

/**
 * Get current ISO timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Base log entry with common fields
 */
interface LogEntry {
  level: string;
  msg: string;
  time: string;
  [key: string]: unknown;
}

const logger = {
  /**
   * Log debug-level messages (development only)
   * Useful for detailed troubleshooting without production noise
   */
  debug: (msg: string, meta?: Record<string, unknown>): void => {
    if (!isProduction) {
      const entry: LogEntry = {
        level: "debug",
        msg,
        time: getTimestamp(),
        ...(meta ? redactSensitiveFields({ ...meta }) : undefined),
      };
      console.log(JSON.stringify(entry));
    }
  },

  /**
   * Log informational messages (development only)
   */
  info: (msg: string, meta?: Record<string, unknown>): void => {
    if (!isProduction) {
      const entry: LogEntry = {
        level: "info",
        msg,
        time: getTimestamp(),
        ...(meta ? redactSensitiveFields({ ...meta }) : undefined),
      };
      console.log(JSON.stringify(entry));
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (msg: string, meta?: Record<string, unknown>): void => {
    if (!isProduction) {
      const entry: LogEntry = {
        level: "warn",
        msg,
        time: getTimestamp(),
        ...(meta ? redactSensitiveFields({ ...meta }) : undefined),
      };
      console.warn(JSON.stringify(entry));
    }
  },

  /**
   * Log error messages (always logged, even in production)
   * Includes error details and stack trace when available
   */
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>): void => {
    const entry: LogEntry = {
      level: "error",
      msg,
      time: getTimestamp(),
      error: err ? safeError(err) : undefined,
      ...(meta ? redactSensitiveFields({ ...meta }) : undefined),
    };
    console.error(JSON.stringify(entry));
  },
};

export { logger };
