import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

/**
 * Enhanced logger with request ID support for distributed tracing
 *
 * @example
 * ```ts
 * import { logger } from "@saasfly/api/logger";
 *
 * logger.info("Processing request", { requestId: "uuid" });
 * logger.error("Operation failed", error, { requestId: "uuid" });
 * ```
 */
export { logger };
