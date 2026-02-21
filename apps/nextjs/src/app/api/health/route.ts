import { NextResponse } from "next/server";

import { HTTP_SECURITY_HEADERS } from "@saasfly/common";

import { logger } from "~/lib/logger";

/**
 * Health check endpoint for Kubernetes probes and load balancers.
 * No authentication - intentionally public for fast health monitoring.
 */

/**
 * Security headers for health endpoint responses
 * Prevents MIME sniffing, clickjacking, and search engine indexing
 */
const HEALTH_SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Content-Type": "application/json",
  "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  // Security: Prevent search engines from indexing API endpoints
  "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
} as const;

/**
 * Security headers for HEAD responses (no Content-Type needed)
 */
const HEAD_SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  // Security: Prevent search engines from indexing API endpoints
  "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
} as const;

export function GET() {
  try {
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "1.0.0",
      },
      {
        status: 200,
        headers: HEALTH_SECURITY_HEADERS,
      },
    );
  } catch (error) {
    logger.error("Health check failed", error);
    return NextResponse.json(
      { status: "unhealthy", error: "Health check failed" },
      {
        status: 503,
        headers: HEALTH_SECURITY_HEADERS,
      },
    );
  }
}

export function HEAD() {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: HEAD_SECURITY_HEADERS,
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: HEAD_SECURITY_HEADERS,
    });
  }
}
