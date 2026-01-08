interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
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

    return {
      success: false,
      remaining: 0,
      resetAt: entry.lastRefill + this.windowMs,
    };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

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

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

export type EndpointType = "read" | "write" | "stripe";

export const rateLimitConfigs: Record<EndpointType, RateLimitConfig> = {
  read: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  write: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  stripe: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
};

const limiters: Record<EndpointType, RateLimiter> = {
  read: new RateLimiter(rateLimitConfigs.read),
  write: new RateLimiter(rateLimitConfigs.write),
  stripe: new RateLimiter(rateLimitConfigs.stripe),
};

export function getLimiter(type: EndpointType): RateLimiter {
  return limiters[type];
}

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

export type { NextRequest } from "next/server";
