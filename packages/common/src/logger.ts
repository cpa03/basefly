/**
 * Centralized Logger
 *
 * A unified logging solution for the Basefly platform. This module provides
 * consistent logging across all packages with support for:
 * - Structured logging with pino
 * - Request context (requestId, userId)
 * - Package identification
 * - Environment-based configuration
 *
 * @module @saasfly/common/logger
 */

import pino, { type Logger } from "pino";

import { IS_DEV, IS_TEST, LOG_LEVEL } from "./config/env";

/**
 * Supported package names for logging context
 */
export type PackageName = "api" | "db" | "stripe" | "auth" | "common";

/**
 * Extended metadata for log entries
 */
export interface LogMetadata {
  /** Request identifier for tracing */
  requestId?: string;
  /** User identifier for audit trails */
  userId?: string;
  /** Additional context */
  [key: string]: unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Package name for context */
  package: PackageName;
  /** Override log level (defaults to env LOG_LEVEL) */
  level?: string;
  /** Enable pretty printing in development */
  pretty?: boolean;
}

/**
 * Sensitive field name patterns that should be redacted from logs.
 * Any metadata key matching these patterns (case-insensitive partial match)
 * will have its value replaced with "[REDACTED]" before logging.
 *
 * This prevents accidental leakage of secrets, tokens, and PII through logs.
 *
 * @see apps/nextjs/src/lib/logger.ts for the identical pattern list used by the frontend logger
 */
const SENSITIVE_FIELD_PATTERNS = [
  "secret",
  "token",
  "password",
  "credential",
  "api_key",
  "authorization",
  "set-cookie",
  "cookie",
  "session",
  "private_key",
  "privatekey",
] as const;

/**
 * Build pino redact configuration from sensitive field patterns.
 * Generates both top-level and nested paths (1 level deep) for each pattern.
 */
export function buildRedactConfig(): { paths: string[]; censor: string } {
  const paths: string[] = [];
  for (const pattern of SENSITIVE_FIELD_PATTERNS) {
    // Match the field at any level (top-level and one-level nested)
    paths.push(pattern);
    paths.push(`*.${pattern}`);
  }
  return { paths, censor: "[REDACTED]" };
}

/**
 * Creates a configured logger instance for a specific package
 *
 * @param config - Logger configuration
 * @returns Configured pino logger instance
 *
 * @example
 * ```typescript
 * import { createLogger } from "@saasfly/common/logger";
 *
 * const logger = createLogger({ package: "api" });
 * logger.info({ requestId: "req-123" }, "Processing request");
 * ```
 *
 * Security: All loggers created via this function automatically redact
 * sensitive fields (secrets, tokens, passwords, etc.) before output.
 */
export function createLogger(config: LoggerConfig): Logger {
  const level = config.level ?? LOG_LEVEL;
  const shouldPretty = config.pretty ?? (IS_DEV && !IS_TEST);

  return pino({
    level: isTest() ? "silent" : level,
    base: {
      package: config.package,
    },
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: buildRedactConfig(),
    transport: shouldPretty
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "package,pid,hostname",
          },
        }
      : undefined,
  });
}

/**
 * Check if running in test environment
 */
function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Default logger instance using "common" package context
 * Use this for general logging when package-specific logger is not needed
 */
export const logger = createLogger({ package: "common" });

/**
 * Convenience logger creators for each package
 * These provide type-safe loggers with package context pre-configured
 */
export const apiLogger = createLogger({ package: "api" });
export const dbLogger = createLogger({ package: "db" });
export const stripeLogger = createLogger({ package: "stripe" });
export const authLogger = createLogger({ package: "auth" });

/**
 * Type-safe logging interface that all packages should use
 * This provides consistency across the codebase
 */
export interface BaseLogger {
  debug(message: string, data?: LogMetadata): void;
  info(message: string, data?: LogMetadata): void;
  warn(message: string, data?: LogMetadata): void;
  error(message: string, error?: unknown, data?: LogMetadata): void;
}

/**
 * Creates a type-safe logger wrapper around a pino logger
 *
 * @param pinoLogger - The pino logger instance
 * @returns Logger interface conforming to BaseLogger
 */
export function createLoggerWrapper(pinoLogger: Logger): BaseLogger {
  return {
    debug(message: string, data?: LogMetadata): void {
      pinoLogger.debug(data ?? {}, message);
    },
    info(message: string, data?: LogMetadata): void {
      pinoLogger.info(data ?? {}, message);
    },
    warn(message: string, data?: LogMetadata): void {
      pinoLogger.warn(data ?? {}, message);
    },
    error(message: string, error?: unknown, data?: LogMetadata): void {
      pinoLogger.error({ error, ...data }, message);
    },
  };
}
