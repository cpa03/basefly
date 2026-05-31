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
      error: err,
      ...(meta ? redactSensitiveFields({ ...meta }) : undefined),
    };
    console.error(JSON.stringify(entry));
  },
};

export { logger };
