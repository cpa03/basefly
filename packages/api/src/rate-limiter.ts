import type { NextRequest } from "next/server";

import {
  RATE_LIMIT_DEFAULTS,
  type EndpointType,
  type RateLimitConfig,
} from "@saasfly/common";

import { logger } from "./logger";

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    logger.debug(
      {
        maxRequests: this.maxRequests,
        windowMs: this.windowMs,
      },
      "Rate limiter initialized",
    );
    this.startCleanup();
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(identifier);

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

    const elapsed = now - entry.lastRefill;

    if (elapsed >= this.windowMs) {
      entry.tokens = this.maxRequests;
      entry.lastRefill = now;
    }

    if (entry.tokens > 0) {
      entry.tokens -= 1;
      return {
        success: true,
        remaining: entry.tokens,
        resetAt: entry.lastRefill + this.windowMs,
      };
    }

    logger.warn(
      {
        identifier,
        remaining: 0,
        resetAt: entry.lastRefill + this.windowMs,
        windowMs: this.windowMs,
        maxRequests: this.maxRequests,
      },
      "Rate limit exceeded",
    );

    return {
      success: false,
      remaining: 0,
      resetAt: entry.lastRefill + this.windowMs,
    };
  }

  reset(identifier: string): void {
    const deleted = this.store.delete(identifier);
    if (deleted) {
      logger.debug({ identifier }, "Rate limit reset for identifier");
    }
  }

  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      for (const [key, entry] of this.store.entries()) {
        if (now - entry.lastRefill > this.windowMs * 2) {
          this.store.delete(key);
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        logger.debug(
          {
            cleanedCount,
            remainingEntries: this.store.size,
          },
          "Rate limiter cleanup completed",
        );
      }
    }, this.windowMs);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    const entryCount = this.store.size;
    this.store.clear();
    logger.debug(
      {
        clearedEntries: entryCount,
      },
      "Rate limiter destroyed",
    );
  }
}

export { type EndpointType };

export const rateLimitConfigs: Record<EndpointType, RateLimitConfig> =
  RATE_LIMIT_DEFAULTS;

const limiters: Record<EndpointType, RateLimiter> = {
  read: new RateLimiter(RATE_LIMIT_DEFAULTS.read),
  write: new RateLimiter(RATE_LIMIT_DEFAULTS.write),
  stripe: new RateLimiter(RATE_LIMIT_DEFAULTS.stripe),
};

export function getLimiter(type: EndpointType): RateLimiter {
  return limiters[type];
}

export function getIdentifier(
  userId: string | null,
  req?: NextRequest,
): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (req) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    return `ip:${ip}`;
  }

  return "unknown";
}
