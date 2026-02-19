/* eslint-disable no-console */
/**
 * Simple JSON logger for database operations
 *
 * Provides structured logging for database operations with request ID support
 * for distributed tracing. Uses console-based output to avoid additional
 * dependencies while maintaining consistent log format.
 *
 * @example
 * ```ts
 * import { logger } from "./logger";
 *
 * logger.info("Starting database operation", { requestId: "uuid", table: "User" });
 * logger.error("Database operation failed", error, { requestId: "uuid" });
 * ```
 */

interface LoggerMetadata {
  requestId?: string;
  [key: string]: unknown;
}

const isTest = process.env.NODE_ENV === "test";

/**
 * Database operation logger
 *
 * - info/warn: Disabled in test mode to reduce noise
 * - error: Always logged for debugging production issues
 */
export const logger = {
  info(message: string, data?: LoggerMetadata): void {
    if (isTest) return;
    console.log(
      JSON.stringify({
        level: 30, // pino info level
        time: Date.now(),
        msg: message,
        ...data,
      }),
    );
  },

  warn(message: string, data?: LoggerMetadata): void {
    if (isTest) return;
    console.warn(
      JSON.stringify({
        level: 40, // pino warn level
        time: Date.now(),
        msg: message,
        ...data,
      }),
    );
  },

  error(message: string, error?: unknown, data?: LoggerMetadata): void {
    // Always log errors, even in test mode
    console.error(
      JSON.stringify({
        level: 50, // pino error level
        time: Date.now(),
        msg: message,
        error:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
        ...data,
      }),
    );
  },
};
