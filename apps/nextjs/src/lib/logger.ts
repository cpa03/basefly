/**
 * Next.js application logger
 *
 * A thin wrapper around the shared @saasfly/common pino-based logger.
 * Provides consistent logging with the rest of the codebase.
 *
 * Features:
 * - Structured logging via pino with ISO 8601 timestamps
 * - Sensitive field redaction (secrets, tokens, passwords)
 * - Request ID support for distributed tracing
 * - Log level control via LOG_LEVEL environment variable
 * - Debug/info/warn suppressed in production by default
 *
 * @example
 * ```ts
 * import { logger } from "~/lib/logger";
 *
 * logger.info("Processing request", { requestId: "uuid" });
 * logger.error("Operation failed", error, { requestId: "uuid" });
 * ```
 */

import {
  createLogger,
  createLoggerWrapper,
  type BaseLogger,
} from "@saasfly/common";

/**
 * Create a pino-based logger for the Next.js app.
 * Uses LOG_LEVEL env var (defaults to "info", "debug" in development).
 * In production, debug/info/warn are suppressed by setting level to "error"
 * unless LOG_LEVEL is explicitly configured.
 */
const pinoLogger = createLogger({
  package: "api",
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "error" : "debug"),
  pretty: process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test",
});

/**
 * Type-safe logger instance for the Next.js application.
 * Provides debug, info, warn, and error methods with
 * automatic sensitive field redaction.
 */
const logger: BaseLogger = createLoggerWrapper(pinoLogger);

export { logger };
