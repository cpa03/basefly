/**
 * Logger with request ID support for distributed tracing in Stripe integration
 *
 * @example
 * ```ts
 * import { logger } from "@saasfly/stripe/logger";
 *
 * logger.info("Processing webhook", { requestId: "uuid" });
 * logger.error("Stripe operation failed", error, { requestId: "uuid" });
 * ```
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

interface LoggerMetadata {
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(JSON.stringify({ level: "debug", message, ...data }));
    }
  }

  info(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(JSON.stringify({ level: "info", message, ...data }));
    }
  }

  warn(message: string, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(JSON.stringify({ level: "warn", message, ...data }));
    }
  }

  error(message: string, error?: unknown, data?: LoggerMetadata) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        JSON.stringify({ level: "error", message, error, ...data }),
      );
    }
  }
}

export const logger = new Logger();
