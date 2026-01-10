/**
 * Simple JSON logger with request ID support for distributed tracing
 * 
 * @example
 * ```ts
 * import { logger } from "~/lib/logger";
 * 
 * logger.info("Processing request", { requestId: "uuid" });
 * logger.error("Operation failed", error, { requestId: "uuid" });
 * ```
 */
const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info", msg, ...meta })),
  warn: (msg: string, meta?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn", msg, ...meta })),
  error: (msg: string, err?: Error | unknown, meta?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", msg, error: err, ...meta })),
};

export { logger };
