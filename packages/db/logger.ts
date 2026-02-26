/**
 * Database Logger
 *
 * Centralized logger for the DB package with typed wrapper.
 * Uses the shared logging solution from @saasfly/common/logger
 */

import { dbLogger, createLoggerWrapper, type BaseLogger } from "@saasfly/common";

type LoggerMetadata = Record<string, unknown>;

/**
 * Database-specific logger with typed methods
 * Provides consistent interface for database operations
 */
const dbLoggerWrapper: BaseLogger = createLoggerWrapper(dbLogger);

export const logger = {
  info(message: string, data?: LoggerMetadata): void {
    dbLoggerWrapper.info(message, data);
  },

  warn(message: string, data?: LoggerMetadata): void {
    dbLoggerWrapper.warn(message, data);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata): void {
    dbLoggerWrapper.error(message, error, data);
  },
};
