/**
 * Cache Configuration
 *
 * Centralized cache control and TTL settings for HTTP headers,
 * eliminating hardcoded cache values scattered across the codebase.
 *
 * @module @saasfly/common/config/cache
 */

/**
 * Cache duration in seconds
 * Use these constants instead of hardcoded values
 */
export const CACHE_DURATION = {
  /** No cache - for dynamic content */
  NO_CACHE: 0,
  /** Short cache - 1 minute */
  ONE_MINUTE: 60,
  /** Short cache - 5 minutes */
  FIVE_MINUTES: 300,
  /** Medium cache - 1 hour */
  ONE_HOUR: 3600,
  /** Medium cache - 1 day */
  ONE_DAY: 86400,
  /** Long cache - 1 week */
  ONE_WEEK: 604800,
  /** Long cache - 1 month (30 days) */
  ONE_MONTH: 2592000,
  /** Maximum cache - 1 year (immutable assets) */
  ONE_YEAR: 31536000,
  /** HSTS max age - 2 years (recommended) */
  HSTS_MAX_AGE: 63072000,
} as const;

/**
 * Cache-Control header values
 * Pre-built directives for common caching scenarios
 */
export const CACHE_CONTROL = {
  /** No cache - for dynamic content that should never be cached */
  NO_CACHE: "public, max-age=0, must-revalidate",
  /** Short cache - for semi-dynamic content */
  SHORT: `public, max-age=${CACHE_DURATION.ONE_MINUTE}`,
  /** Medium cache - for semi-static content */
  MEDIUM: `public, max-age=${CACHE_DURATION.ONE_HOUR}`,
  /** Long cache - for static content */
  LONG: `public, max-age=${CACHE_DURATION.ONE_DAY}`,
  /** Immutable assets - for versioned static files (JS, CSS with hash) */
  IMMUTABLE: `public, max-age=${CACHE_DURATION.ONE_YEAR}, immutable`,
  /** API responses - no cache by default */
  API: "public, max-age=0, must-revalidate",
  /** Static assets - long cache for files that don't change often */
  STATIC: `public, max-age=${CACHE_DURATION.ONE_WEEK}`,
} as const;

/**
 * Security header values
 * Centralized security-related header values
 */
export const SECURITY_HEADERS = {
  /** HSTS (HTTP Strict Transport Security) header value */
  HSTS: `max-age=${CACHE_DURATION.HSTS_MAX_AGE}; includeSubDomains; preload`,
  /** Frame options - prevent clickjacking */
  FRAME_OPTIONS: "SAMEORIGIN",
  /** Content-Type options - prevent MIME sniffing */
  CONTENT_TYPE_OPTIONS: "nosniff",
  /** Referrer policy */
  REFERRER_POLICY: "origin-when-cross-origin",
  /** Permissions policy - restrict browser features */
  PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=()",
  /** DNS prefetch control */
  DNS_PREFETCH_CONTROL: "on",
} as const;

/**
 * Generate a Cache-Control header with custom max-age
 * @param maxAge - Max age in seconds
 * @param options - Additional options
 * @returns Cache-Control header value
 */
export function generateCacheControl(
  maxAge: number,
  options?: {
    /** Set to true for immutable assets */
    immutable?: boolean;
    /** Set to false for private cache only */
    public?: boolean;
    /** Add must-revalidate directive */
    mustRevalidate?: boolean;
  },
): string {
  const directives: string[] = [];

  // Public or private
  directives.push(options?.public !== false ? "public" : "private");

  // Max age
  directives.push(`max-age=${maxAge}`);

  // Immutable
  if (options?.immutable) {
    directives.push("immutable");
  }

  // Must revalidate
  if (options?.mustRevalidate) {
    directives.push("must-revalidate");
  }

  return directives.join(", ");
}

/**
 * Common cache header configurations for Next.js headers()
 * Use these with the headers() config in next.config.mjs
 */
export const NEXTJS_CACHE_HEADERS = {
  /** Default HTML pages - no cache for dynamic content */
  default: {
    key: "Cache-Control",
    value: CACHE_CONTROL.NO_CACHE,
  },
  /** Static assets (JS, CSS, fonts, images with hash) */
  immutable: {
    key: "Cache-Control",
    value: CACHE_CONTROL.IMMUTABLE,
  },
  /** API routes */
  api: {
    key: "X-Content-Type-Options",
    value: SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  },
} as const;

/**
 * Complete Next.js headers configuration
 * Can be used directly in next.config.mjs async headers()
 */
export function generateNextJsHeaders() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: SECURITY_HEADERS.DNS_PREFETCH_CONTROL,
        },
        {
          key: "Strict-Transport-Security",
          value: SECURITY_HEADERS.HSTS,
        },
        {
          key: "X-Frame-Options",
          value: SECURITY_HEADERS.FRAME_OPTIONS,
        },
        {
          key: "X-Content-Type-Options",
          value: SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        },
        {
          key: "Referrer-Policy",
          value: SECURITY_HEADERS.REFERRER_POLICY,
        },
        {
          key: "Permissions-Policy",
          value: SECURITY_HEADERS.PERMISSIONS_POLICY,
        },
        {
          key: "Cache-Control",
          value: CACHE_CONTROL.NO_CACHE,
        },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: CACHE_CONTROL.IMMUTABLE,
        },
      ],
    },
    {
      source: "/:path*.:ext(js|css|woff2|png|jpg|jpeg|gif|ico|svg)",
      headers: [
        {
          key: "Cache-Control",
          value: CACHE_CONTROL.IMMUTABLE,
        },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        },
      ],
    },
  ];
}

/** Type for cache duration keys */
export type CacheDurationKey = keyof typeof CACHE_DURATION;

/** Type for cache control preset keys */
export type CacheControlKey = keyof typeof CACHE_CONTROL;
