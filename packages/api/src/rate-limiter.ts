import type { NextRequest } from "next/server";

/**
 * Parse numeric environment variable with fallback
 */
function parseEnvNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Rate Limiter
 *
 * Token bucket algorithm implementation for API rate limiting.
 * Protects endpoints from abuse, DDoS attacks, and resource exhaustion.
 *
 * Features:
 * - In-memory storage (Redis-ready for distributed systems)
 * - Automatic cleanup of expired entries
 * - Token bucket algorithm for smooth rate limiting
 * - Per-user or per-IP rate limiting
 * - Environment-driven configuration
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60 * 1000, // 1 minute
 * });
 *
 * const result = limiter.check("user123");
 * if (result.success) {
 *   // Allow request
 *   console.log(`Remaining: ${result.remaining}`);
 * } else {
 *   // Reject request
 *   console.log(`Reset at: ${new Date(result.resetAt)}`);
 * }
 * ```
 */

/**
 * Internal state for a rate limit entry
 */
interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

/**
 * Configuration for rate limiter
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Result of a rate limit check
 */
interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Token Bucket Rate Limiter
 * 
 * Uses the token bucket algorithm where:
 * - Each request consumes 1 token
 * - Tokens refill at end of window
 * - Requests rejected when bucket is empty
 * 
 * Advantages:
 * - Burst-friendly (allows short bursts within limit)
 * - Smooth rate limiting behavior
 * - Predictable reset times
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Create a new rate limiter
   * 
   * @param config - Rate limit configuration
   */
  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;

    this.startCleanup();
  }

  /**
   * Check if a request should be allowed
   * 
   * Updates the token bucket for the identifier and returns
   * whether the request is allowed along with rate limit info.
   * 
   * @param identifier - Unique identifier (user ID or IP address)
   * @returns Rate limit result with success status and metadata
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // First request for this identifier
    if (!entry) {
      this.store.set(identifier, {
        tokens: this.maxRequests - 1,
        lastRefill: now,
      });
      return {
        success: true,
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
      };
    }

    // Refill tokens if window has passed
    const elapsed = now - entry.lastRefill;

    if (elapsed >= this.windowMs) {
      entry.tokens = this.maxRequests;
      entry.lastRefill = now;
    }

    // Check if tokens available
    if (entry.tokens > 0) {
      entry.tokens -= 1;
      return {
        success: true,
        remaining: entry.tokens,
        resetAt: entry.lastRefill + this.windowMs,
      };
    }

    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetAt: entry.lastRefill + this.windowMs,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * 
   * Useful for manual resets or when user logs out.
   * 
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Start automatic cleanup of expired entries
   * 
   * Removes entries older than 2x window duration
   * to prevent memory leaks.
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now - entry.lastRefill > this.windowMs * 2) {
          this.store.delete(key);
        }
      }
    }, this.windowMs);
  }

  /**
   * Clean up rate limiter resources
   * 
   * Stops cleanup interval and clears all stored entries.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

/**
 * Endpoint type for rate limiting
 */
export type EndpointType = "read" | "write" | "stripe";

/**
 * Pre-configured rate limit settings for different endpoint types
 * 
 * Read operations: Higher limit (less impact)
 * Write operations: Lower limit (more impact)
 * Stripe operations: Lowest limit (external API calls)
 * 
 * All values are configurable via environment variables:
 * - NEXT_PUBLIC_RATE_LIMIT_READ_MAX (default: 100)
 * - NEXT_PUBLIC_RATE_LIMIT_WRITE_MAX (default: 20)
 * - NEXT_PUBLIC_RATE_LIMIT_STRIPE_MAX (default: 10)
 * - NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS (default: 60000)
 */
export const rateLimitConfigs: Record<EndpointType, RateLimitConfig> = {
  read: {
    maxRequests: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_READ_MAX, 100),
    windowMs: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS, 60 * 1000), // 1 minute
  },
  write: {
    maxRequests: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_WRITE_MAX, 20),
    windowMs: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS, 60 * 1000), // 1 minute
  },
  stripe: {
    maxRequests: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_STRIPE_MAX, 10),
    windowMs: parseEnvNumber(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS, 60 * 1000), // 1 minute
  },
};

/**
 * Pre-configured rate limiters for each endpoint type
 * 
 * Shared across all API endpoints for consistent rate limiting.
 * Can be extended to use Redis for distributed systems.
 */
const limiters: Record<EndpointType, RateLimiter> = {
  read: new RateLimiter(rateLimitConfigs.read),
  write: new RateLimiter(rateLimitConfigs.write),
  stripe: new RateLimiter(rateLimitConfigs.stripe),
};

/**
 * Get the rate limiter for a specific endpoint type
 * 
 * @param type - Endpoint type (read, write, or stripe)
 * @returns Configured rate limiter instance
 */
export function getLimiter(type: EndpointType): RateLimiter {
  return limiters[type];
}

/**
 * Generate a rate limit identifier for a request
 * 
 * Uses user ID for authenticated requests, IP address for unauthenticated.
 * 
 * @param userId - User ID if authenticated
 * @param req - Next.js request object (optional)
 * @returns Unique identifier string
 */
export function getIdentifier(userId: string | null, req?: NextRequest): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    return `ip:${ip}`;
  }

  return "unknown";
}
