/**
 * Log Level Configuration
 *
 * Extracted from env.ts to break the circular dependency between logger.ts and env.ts.
 * Provides log level constants and environment detection that the logger needs,
 * without importing any logging infrastructure.
 *
 * @module @saasfly/common/config/log-level
 */

/**
 * Log levels following standard logging conventions
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Default log level when LOG_LEVEL env var is not set
 */
export const DEFAULT_LOG_LEVEL: LogLevel = LogLevel.INFO;

/**
 * Current log level from environment or default
 */
export const LOG_LEVEL: string = process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL;

/**
 * Current Node.js environment
 */
export const NODE_ENV: string = process.env.NODE_ENV ?? "production";

/**
 * Check if running in development mode
 */
export const IS_DEV: boolean = NODE_ENV === "development";

/**
 * Check if running in production mode
 */
export const IS_PROD: boolean = NODE_ENV === "production";

/**
 * Check if running in test mode
 */
export const IS_TEST: boolean = NODE_ENV === "test";

/**
 * Check if running in edge runtime
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export const IS_EDGE: boolean = (process.env as any).NEXT_RUNTIME === "edge";

/**
 * Validate that a log level is valid
 */
export function isValidLogLevel(level: string): level is LogLevel {
  return Object.values(LogLevel).includes(level as LogLevel);
}
