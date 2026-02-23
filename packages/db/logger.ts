import pino from "pino";

import { IS_DEV, LOG_LEVEL } from "@saasfly/common";

/**
 * Structured logger for database operations
 *
 * Uses pino for consistent, structured logging across all packages.
 * Provides request ID support for distributed tracing.
 *
 * @example
 * ```ts
 * import { logger } from "./logger";
 *
 * logger.info("Starting database operation", { requestId: "uuid", table: "User" });
 * logger.error("Database operation failed", error, { requestId: "uuid" });
 * ```
 */

type LoggerMetadata = Record<string, unknown>;

const pinoLogger = pino({
  level: LOG_LEVEL,
  transport: IS_DEV
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

/**
 * Database operation logger
 *
 * - Uses pino for structured JSON logging
 * - Log level configurable via LOG_LEVEL environment variable
 * - Pretty output in development mode
 */
const logger = {
  debug(message: string, data?: LoggerMetadata) {
    pinoLogger.debug(data ?? {}, message);
  },

  info(message: string, data?: LoggerMetadata) {
    pinoLogger.info(data ?? {}, message);
  },

  warn(message: string, data?: LoggerMetadata) {
    pinoLogger.warn(data ?? {}, message);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    pinoLogger.error({ error, ...data }, message);
  },
};

export { logger };
