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
 * Note: Named ADMIN_EMAIL to match the environment variable in .env.example
 */
export const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL ?? "";

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
  if (!ADMIN_EMAIL) return false;
  return ADMIN_EMAIL.split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

/**
 * Validate that a log level is valid
 */
export function isValidLogLevel(level: string): level is LogLevel {
  return Object.values(LogLevel).includes(level as LogLevel);
}

/**
 * Redis connection URL for distributed rate limiting
 * Format: redis://[[username:]password@]host[:port][/database]
 * Leave empty to use in-memory rate limiter (development)
 */
export const REDIS_URL: string = process.env.REDIS_URL ?? "";

/**
 * Check if Redis is configured (for production/distributed deployments)
 */
export const IS_REDIS_CONFIGURED = !!REDIS_URL;

// ---------------------------------------------------------------------
// Environment Validation - Required Variables
// ---------------------------------------------------------------------

/**
 * Critical environment variables that must be configured for production
 * These should be validated at application startup to fail fast on misconfiguration
 */
export const REQUIRED_ENV_VARS = [
  // Authentication - Clerk is required for the app to function
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  // Database - required for any data operations
  "POSTGRES_URL",
  // App URL - required for generating URLs and redirects
  "NEXT_PUBLIC_APP_URL",
] as const;

/**
 * Optional but recommended environment variables
 */
export const RECOMMENDED_ENV_VARS = [
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "ADMIN_EMAIL",
] as const;

/**
 * Validation result type
 */
export interface EnvValidationResult {
  valid: boolean;
  missing: readonly string[];
  missingRecommended: readonly string[];
}

/**
 * Validate environment variables
 * Returns validation result with missing required/recommended vars
 * Note: Does not throw - caller decides how to handle validation result
 */
export function validateEnvVars(): EnvValidationResult {
  const missing: string[] = [];
  const missingRecommended: string[] = [];

  // Check required vars
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missing.push(varName);
    }
  }

  // Check recommended vars (non-blocking)
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missingRecommended.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    missingRecommended,
  };
}

/**
 * Get human-readable environment validation error message
 */
export function getEnvValidationMessage(): string {
  const result = validateEnvVars();

  if (result.valid) {
    return "All required environment variables are configured.";
  }

  const messages: string[] = [];

  if (result.missing.length > 0) {
    messages.push(
      `Missing required environment variables: ${result.missing.join(", ")}`
    );
  }

  if (result.missingRecommended.length > 0) {
    messages.push(
      `Missing recommended environment variables: ${result.missingRecommended.join(", ")}`
    );
  }

  return messages.join("\n");
}

/**
 * Initialize environment validation
 * Throws in production if required environment variables are missing
 * In development, logs warnings but does not throw
 */
export function initEnvValidation(): void {
  const result = validateEnvVars();

  if (!result.valid) {
    const message = getEnvValidationMessage();

    // In production, fail fast
    if (IS_PROD) {
      throw new Error(`Environment validation failed:\n${message}`);
    }

    // In development, log warning
    console.warn(`[env-validation] ${message}`);
  } else if (result.missingRecommended.length > 0) {
    console.warn(
      `[env-validation] Missing recommended environment variables: ${result.missingRecommended.join(", ")}`
    );
  }
}
