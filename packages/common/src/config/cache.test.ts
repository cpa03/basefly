import { describe, expect, it } from "vitest";

import {
  CACHE_CONTROL,
  CACHE_DURATION,
  HTTP_SECURITY_HEADERS,
  NEXTJS_CACHE_HEADERS,
  TIME_MS,
  generateCacheControl,
  generateNextJsHeaders,
  type CacheControlKey,
  type CacheDurationKey,
} from "./cache";

describe("cache.ts - CACHE_DURATION", () => {
  it("should have NO_CACHE with value 0", () => {
    expect(CACHE_DURATION.NO_CACHE).toBe(0);
  });

  it("should have ONE_MINUTE as 60 seconds", () => {
    expect(CACHE_DURATION.ONE_MINUTE).toBe(60);
  });

  it("should have FIVE_MINUTES as 300 seconds", () => {
    expect(CACHE_DURATION.FIVE_MINUTES).toBe(300);
  });

  it("should have ONE_HOUR as 3600 seconds", () => {
    expect(CACHE_DURATION.ONE_HOUR).toBe(3600);
  });

  it("should have ONE_DAY as 86400 seconds", () => {
    expect(CACHE_DURATION.ONE_DAY).toBe(86400);
  });

  it("should have ONE_WEEK as 604800 seconds", () => {
    expect(CACHE_DURATION.ONE_WEEK).toBe(604800);
  });

  it("should have ONE_MONTH as 2592000 seconds (30 days)", () => {
    expect(CACHE_DURATION.ONE_MONTH).toBe(2592000);
  });

  it("should have ONE_YEAR as 31536000 seconds", () => {
    expect(CACHE_DURATION.ONE_YEAR).toBe(31536000);
  });

  it("should have HSTS_MAX_AGE as 63072000 seconds (2 years)", () => {
    expect(CACHE_DURATION.HSTS_MAX_AGE).toBe(63072000);
  });
});

describe("cache.ts - TIME_MS", () => {
  it("should have ONE_SECOND as 1000ms", () => {
    expect(TIME_MS.ONE_SECOND).toBe(1000);
  });

  it("should have ONE_MINUTE as 60000ms", () => {
    expect(TIME_MS.ONE_MINUTE).toBe(60000);
  });

  it("should have FIVE_MINUTES as 300000ms", () => {
    expect(TIME_MS.FIVE_MINUTES).toBe(300000);
  });

  it("should have ONE_HOUR as 3600000ms", () => {
    expect(TIME_MS.ONE_HOUR).toBe(3600000);
  });

  it("should have ONE_DAY as 86400000ms", () => {
    expect(TIME_MS.ONE_DAY).toBe(86400000);
  });

  it("should have ONE_WEEK as 604800000ms", () => {
    expect(TIME_MS.ONE_WEEK).toBe(604800000);
  });
});

describe("cache.ts - CACHE_CONTROL", () => {
  it("should have NO_CACHE with correct directives", () => {
    expect(CACHE_CONTROL.NO_CACHE).toBe("public, max-age=0, must-revalidate");
  });

  it("should have SHORT with ONE_MINUTE max-age", () => {
    expect(CACHE_CONTROL.SHORT).toContain("max-age=60");
  });

  it("should have MEDIUM with ONE_HOUR max-age", () => {
    expect(CACHE_CONTROL.MEDIUM).toContain("max-age=3600");
  });

  it("should have LONG with ONE_DAY max-age", () => {
    expect(CACHE_CONTROL.LONG).toContain("max-age=86400");
  });

  it("should have IMMUTABLE with ONE_YEAR and immutable directive", () => {
    expect(CACHE_CONTROL.IMMUTABLE).toContain("max-age=31536000");
    expect(CACHE_CONTROL.IMMUTABLE).toContain("immutable");
  });

  it("should have API with no-cache directives", () => {
    expect(CACHE_CONTROL.API).toBe("public, max-age=0, must-revalidate");
  });

  it("should have STATIC with ONE_WEEK max-age", () => {
    expect(CACHE_CONTROL.STATIC).toContain("max-age=604800");
  });
});

describe("cache.ts - HTTP_SECURITY_HEADERS", () => {
  it("should have HSTS with correct max-age and directives", () => {
    expect(HTTP_SECURITY_HEADERS.HSTS).toContain("max-age=63072000");
    expect(HTTP_SECURITY_HEADERS.HSTS).toContain("includeSubDomains");
    expect(HTTP_SECURITY_HEADERS.HSTS).toContain("preload");
  });

  it("should have FRAME_OPTIONS as SAMEORIGIN", () => {
    expect(HTTP_SECURITY_HEADERS.FRAME_OPTIONS).toBe("SAMEORIGIN");
  });

  it("should have CONTENT_TYPE_OPTIONS as nosniff", () => {
    expect(HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS).toBe("nosniff");
  });

  it("should have REFERRER_POLICY as origin-when-cross-origin", () => {
    expect(HTTP_SECURITY_HEADERS.REFERRER_POLICY).toBe(
      "origin-when-cross-origin",
    );
  });

  it("should have PERMISSIONS_POLICY with restricted features", () => {
    expect(HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY).toContain("camera=()");
    expect(HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY).toContain(
      "microphone=()",
    );
    expect(HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY).toContain(
      "geolocation=()",
    );
  });

  it("should have DNS_PREFETCH_CONTROL as on", () => {
    expect(HTTP_SECURITY_HEADERS.DNS_PREFETCH_CONTROL).toBe("on");
  });
});

describe("cache.ts - generateCacheControl", () => {
  it("should generate basic cache control header", () => {
    const result = generateCacheControl(60);
    expect(result).toContain("public");
    expect(result).toContain("max-age=60");
  });

  it("should generate private cache when public is false", () => {
    const result = generateCacheControl(60, { public: false });
    expect(result).toContain("private");
  });

  it("should generate public cache by default", () => {
    const result = generateCacheControl(60);
    expect(result).toContain("public");
  });

  it("should add immutable directive when specified", () => {
    const result = generateCacheControl(31536000, { immutable: true });
    expect(result).toContain("immutable");
  });

  it("should not add immutable by default", () => {
    const result = generateCacheControl(60);
    expect(result).not.toContain("immutable");
  });

  it("should add must-revalidate when specified", () => {
    const result = generateCacheControl(0, { mustRevalidate: true });
    expect(result).toContain("must-revalidate");
  });

  it("should combine immutable and must-revalidate", () => {
    const result = generateCacheControl(31536000, {
      immutable: true,
      mustRevalidate: true,
    });
    expect(result).toContain("immutable");
    expect(result).toContain("must-revalidate");
  });

  it("should handle custom max-age", () => {
    const result = generateCacheControl(7200);
    expect(result).toContain("max-age=7200");
  });
});

describe("cache.ts - NEXTJS_CACHE_HEADERS", () => {
  it("should have default header with NO_CACHE", () => {
    expect(NEXTJS_CACHE_HEADERS.default.key).toBe("Cache-Control");
    expect(NEXTJS_CACHE_HEADERS.default.value).toBe(
      CACHE_CONTROL.NO_CACHE,
    );
  });

  it("should have immutable header with IMMUTABLE cache", () => {
    expect(NEXTJS_CACHE_HEADERS.immutable.key).toBe("Cache-Control");
    expect(NEXTJS_CACHE_HEADERS.immutable.value).toBe(
      CACHE_CONTROL.IMMUTABLE,
    );
  });

  it("should have api header with CONTENT_TYPE_OPTIONS", () => {
    expect(NEXTJS_CACHE_HEADERS.api.key).toBe("X-Content-Type-Options");
    expect(NEXTJS_CACHE_HEADERS.api.value).toBe(
      HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
    );
  });
});

describe("cache.ts - generateNextJsHeaders", () => {
  it("should return an array of header configurations", () => {
    const result = generateNextJsHeaders();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should include catch-all route", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    expect(catchAll).toBeDefined();
    expect(catchAll?.headers).toBeDefined();
    expect(catchAll?.headers?.length).toBeGreaterThan(0);
  });

  it("should include HSTS header in catch-all", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const hstsHeader = catchAll?.headers?.find(
      (h) => h.key === "Strict-Transport-Security",
    );
    expect(hstsHeader).toBeDefined();
    expect(hstsHeader?.value).toContain("max-age=");
  });

  it("should include X-Frame-Options header", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const frameOptionsHeader = catchAll?.headers?.find(
      (h) => h.key === "X-Frame-Options",
    );
    expect(frameOptionsHeader).toBeDefined();
  });

  it("should include X-Content-Type-Options header", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const contentTypeHeader = catchAll?.headers?.find(
      (h) => h.key === "X-Content-Type-Options",
    );
    expect(contentTypeHeader).toBeDefined();
  });

  it("should include Referrer-Policy header", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const referrerHeader = catchAll?.headers?.find(
      (h) => h.key === "Referrer-Policy",
    );
    expect(referrerHeader).toBeDefined();
  });

  it("should include Permissions-Policy header", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const permissionsHeader = catchAll?.headers?.find(
      (h) => h.key === "Permissions-Policy",
    );
    expect(permissionsHeader).toBeDefined();
  });

  it("should include DNS-Prefetch-Control header", () => {
    const result = generateNextJsHeaders();
    const catchAll = result.find(
      (config) => config.source === "/(.*)",
    );
    const dnsHeader = catchAll?.headers?.find(
      (h) => h.key === "X-DNS-Prefetch-Control",
    );
    expect(dnsHeader).toBeDefined();
  });

  it("should include Next.js static assets configuration", () => {
    const result = generateNextJsHeaders();
    const staticAssets = result.find(
      (config) => config.source === "/_next/static/(.*)",
    );
    expect(staticAssets).toBeDefined();
    expect(staticAssets?.headers).toBeDefined();
  });

  it("should include hashed assets configuration", () => {
    const result = generateNextJsHeaders();
    const hashedAssets = result.find(
      (config) => config.source === "/:path*.:ext(js|css|woff2|png|jpg|jpeg|gif|ico|svg)",
    );
    expect(hashedAssets).toBeDefined();
  });

  it("should include API routes configuration", () => {
    const result = generateNextJsHeaders();
    const apiRoutes = result.find((config) => config.source === "/api/(.*)");
    expect(apiRoutes).toBeDefined();
  });

  it("should use IMMUTABLE cache for static assets", () => {
    const result = generateNextJsHeaders();
    const staticAssets = result.find(
      (config) => config.source === "/_next/static/(.*)",
    );
    const cacheHeader = staticAssets?.headers?.find(
      (h) => h.key === "Cache-Control",
    );
    expect(cacheHeader?.value).toContain("immutable");
  });
});

describe("cache.ts - Type exports", () => {
  it("should export CacheDurationKey type", () => {
    const _durationKey: CacheDurationKey = "ONE_DAY";
    expect(_durationKey).toBeDefined();
  });

  it("should export CacheControlKey type", () => {
    const _controlKey: CacheControlKey = "IMMUTABLE";
    expect(_controlKey).toBeDefined();
  });

  it("should allow all CACHE_DURATION keys as CacheDurationKey", () => {
    const keys: CacheDurationKey[] = [
      "NO_CACHE",
      "ONE_MINUTE",
      "FIVE_MINUTES",
      "ONE_HOUR",
      "ONE_DAY",
      "ONE_WEEK",
      "ONE_MONTH",
      "ONE_YEAR",
      "HSTS_MAX_AGE",
    ];
    keys.forEach((key) => {
      const _key: CacheDurationKey = key;
      expect(_key).toBeDefined();
    });
  });

  it("should allow all CACHE_CONTROL keys as CacheControlKey", () => {
    const keys: CacheControlKey[] = [
      "NO_CACHE",
      "SHORT",
      "MEDIUM",
      "LONG",
      "IMMUTABLE",
      "API",
      "STATIC",
    ];
    keys.forEach((key) => {
      const _key: CacheControlKey = key;
      expect(_key).toBeDefined();
    });
  });
});
