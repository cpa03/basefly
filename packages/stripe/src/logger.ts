/**
 * Stripe Logger
 *
 * Re-exports the shared pino-based logger from @saasfly/common
 * pre-configured with the "stripe" package context.
 *
 * Provides a consistent logging interface with automatic sensitive
 * field redaction and request tracking support.
 */

import {
  createLoggerWrapper,
  stripeLogger,
  type BaseLogger,
} from "@saasfly/common";

/**
 * Stripe-specific logger with typed methods and auto-redaction.
 * Uses the shared pino instance configured for the stripe package.
 */
const logger: BaseLogger = createLoggerWrapper(stripeLogger);

export { logger };
