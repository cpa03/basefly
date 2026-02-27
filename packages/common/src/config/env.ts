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

export const REQUIRED_ENV_VARS = {
  POSTGRES_URL: { desc: "PostgreSQL URL", envs: ["development", "production", "test"] },
  CLERK_SECRET_KEY: { desc: "Clerk secret key", envs: ["development", "production"] },
  CLERK_PUBLISHABLE_KEY: { desc: "Clerk publishable key", envs: ["development", "production"] },
  STRIPE_API_KEY: { desc: "Stripe API key", envs: ["production"] },
  STRIPE_WEBHOOK_SECRET: { desc: "Stripe webhook secret", envs: ["production"] },
  RESEND_API_KEY: { desc: "Resend API key", envs: ["production"] },
  NEXT_PUBLIC_APP_URL: { desc: "App public URL", envs: ["production"] },
} as const;

export interface EnvValidationResult { valid: boolean; missing: string[]; error?: string; }

export function validateEnvironment(): EnvValidationResult {
  if (IS_TEST) return { valid: true, missing: [] };
  if (process.env.SKIP_ENV_VALIDATION === "true") return { valid: true, missing: [] };
  const missing: string[] = [];
  for (const [key, cfg] of Object.entries(REQUIRED_ENV_VARS)) {
    if ((cfg.envs as readonly string[]).includes(NODE_ENV) && !process.env[key]) missing.push(key);
  }
  return missing.length > 0 ? { valid: false, missing, error: `Missing: ${missing.join(", ")}` } : { valid: true, missing: [] };
}

export function validateEnvironmentSync(): void {
  const r = validateEnvironment();
  if (!r.valid) throw new Error(r.error);
}
