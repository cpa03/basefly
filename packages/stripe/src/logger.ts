/**
 * Stripe Logger
 *
 * Centralized logger for the Stripe package with request context support.
 * Uses the shared logging solution from @saasfly/common/logger
 */

import { stripeLogger, createLoggerWrapper, type BaseLogger } from "@saasfly/common";

interface LoggerMetadata {
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Stripe-specific logger with typed methods
 * Provides consistent interface with request tracking
 */
const stripeLoggerWrapper: BaseLogger = createLoggerWrapper(stripeLogger);

const logger = {
  debug(message: string, data?: LoggerMetadata) {
    stripeLoggerWrapper.debug(message, data);
  },

  info(message: string, data?: LoggerMetadata) {
    stripeLoggerWrapper.info(message, data);
  },

  warn(message: string, data?: LoggerMetadata) {
    stripeLoggerWrapper.warn(message, data);
  },

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    stripeLoggerWrapper.error(message, error, data);
  },
};

export { logger };
