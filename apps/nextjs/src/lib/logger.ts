/* eslint-disable no-console */
/**
 * Simple JSON logger with request ID support for distributed tracing
 * Logs are disabled in production to avoid console noise
 *
 * Features:
 * - ISO 8601 timestamps for all log entries
 * - Request ID support for distributed tracing
 * - Debug level for development (disabled in production)
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
        ...meta,
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
        ...meta,
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
        ...meta,
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
      ...meta,
    };
    console.error(JSON.stringify(entry));
  },
};

export { logger };
