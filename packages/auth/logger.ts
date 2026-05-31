/**
 * Auth Logger
 *
 * Centralized logger for the Auth package.
 * Uses the shared logging solution from @saasfly/common/logger
 */

import {
  authLogger,
  createLoggerWrapper,
  type BaseLogger,
} from "@saasfly/common";

type LoggerMetadata = Record<string, unknown>;

/**
 * Auth-specific logger with typed methods
 * Provides consistent interface for authentication operations
 */
const authLoggerWrapper: BaseLogger = createLoggerWrapper(authLogger);

const logger = {
  debug(message: string, data?: LoggerMetadata) {
    authLoggerWrapper.debug(message, data);
  },

  info(message: string, data?: LoggerMetadata) {
    authLoggerWrapper.info(message, data);
  },

  warn(message: string, data?: LoggerMetadata) {
    authLoggerWrapper.warn(message, data);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    authLoggerWrapper.error(message, error, data);
  },
};

export { logger };
