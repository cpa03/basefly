/**
 * Simple JSON logger with request ID support for distributed tracing
 * Logs are disabled in production to avoid console noise
 *
 * @example
 * ```ts
 * import { logger } from "~/lib/logger";
 *
 * logger.info("Processing request", { requestId: "uuid" });
 * logger.error("Operation failed", error, { requestId: "uuid" });
 * ```
 */
const isProduction = process.env.NODE_ENV === "production";

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (!isProduction) {
      console.log(JSON.stringify({ level: "info", msg, ...meta }));
    }
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (!isProduction) {
      console.warn(JSON.stringify({ level: "warn", msg, ...meta }));
    }
  },
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => {
    // Always log errors, even in production
    console.error(JSON.stringify({ level: "error", msg, error: err, ...meta }));
  },
};

export { logger };
