import { Resend } from "resend";

import { env } from "./env.mjs";

/**
 * Simple logger for Resend integration
 * Uses console in development, silent in production
 */
const emailLogger = {
  info(message: string, data?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Resend] ${message}`, data ?? "");
    }
  },
  warn(message: string, data?: Record<string, unknown>) {
    console.warn(`[Resend] ${message}`, data ?? "");
  },
  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    console.error(`[Resend] ${message}`, { error, ...data });
  },
};

type ResendClient = Resend | null;

/**
 * Safely create a Resend client with error handling
 *
 * @returns Resend client instance or null if not configured
 */
function createResendClientSafe(): ResendClient {
  try {
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey || apiKey.length < 10) {
      emailLogger.warn(
        "RESEND_API_KEY not configured, email features will be disabled",
      );
      return null;
    }

    // Check for placeholder/dummy values
    if (
      apiKey.includes("dummy") ||
      apiKey.includes("placeholder") ||
      apiKey.startsWith("test_")
    ) {
      emailLogger.warn(
        "RESEND_API_KEY appears to be a test/placeholder value, email features will be disabled",
      );
      return null;
    }

    const client = new Resend(apiKey);
    emailLogger.info("Resend client initialized successfully");
    return client;
  } catch (error) {
    emailLogger.error("Failed to initialize Resend client", error);
    return null;
  }
}

const resendClient = createResendClientSafe();

/**
 * Resend email client instance
 * May be null if RESEND_API_KEY is not configured
 */
export const resend: ResendClient = resendClient;

/**
 * Check if Resend is properly configured
 *
 * @returns true if Resend client is available
 */
export function isResendConfigured(): boolean {
  return resend !== null;
}

/**
 * Get the Resend client or throw an error if not configured
 *
 * Use this when email functionality is required and you want to fail fast
 * if the client is not available.
 *
 * @returns Resend client instance
 * @throws Error if Resend is not configured
 *
 * @example
 * ```typescript
 * const client = getResendClientOrThrow();
 * await client.emails.send({
 *   from: 'noreply@example.com',
 *   to: 'user@example.com',
 *   subject: 'Welcome',
 *   html: '<p>Hello!</p>'
 * });
 * ```
 */
export function getResendClientOrThrow(): Resend {
  if (!resend) {
    throw new Error(
      "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM environment variables. See .env.example for required values. Email features will be disabled until configured.",
    );
  }
  return resend;
}
