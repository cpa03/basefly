/**
 * Environment Configuration
 *
 * This module provides centralized access to environment variables and
 * environment-related constants, eliminating scattered process.env access
 * across the codebase.
 *
 * @module @saasfly/common/config/env
 * @example
 * ```ts
 * import { LOG_LEVEL, IS_DEV, NODE_ENV } from "@saasfly/common/config/env";
 *
 * // Use in logger configuration
 * const logger = pino({ level: LOG_LEVEL });
 *
 * // Check environment
 * if (IS_DEV) {
 *   // Development-only code
 * }
 * ```
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
 * Admin emails from environment (comma-separated)
 * Used for admin access control
 */
export const ADMIN_EMAILS: string = process.env.ADMIN_EMAIL ?? "";

/**
 * Checks if an email is in the admin list.
 * Centralized admin verification for use across packages.
 *
 * @param email - The email address to check (can be null/undefined)
 * @returns true if the email is in the ADMIN_EMAIL environment variable
 *
 * @example
 * ```typescript
 * if (isAdminEmail(user?.email)) {
 *   // Grant admin access
 * }
 * ```
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!ADMIN_EMAILS) return false;
  return ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

/**
 * Validate that a log level is valid
 */
export function isValidLogLevel(level: string): level is LogLevel {
  return Object.values(LogLevel).includes(level as LogLevel);
}
