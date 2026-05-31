import { NextResponse } from "next/server";

import { HTTP_SECURITY_HEADERS } from "@saasfly/common";

import { performHealthCheck } from "~/lib/health-check";
import { logger } from "~/lib/logger";

/**
 * Health check endpoint for Kubernetes probes and load balancers.
 * No authentication - intentionally public for fast health monitoring.
 *
 * This endpoint checks all external dependencies:
 * - Database (PostgreSQL)
 * - Stripe API
 * - Clerk authentication
 */

/**
 * Edge runtime for ultra-fast health checks
 * - Near-zero cold start latency
 * - Global edge distribution
 * - Ideal for Kubernetes probes and load balancers
 */
export const runtime = "edge";

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

/**
 * GET /api/health
 *
 * Returns detailed health status including dependency checks.
 * Response time target: < 2 seconds
 */
export async function GET() {
  try {
    const healthResult = await performHealthCheck();

    // Determine HTTP status code based on health
    const httpStatus =
      healthResult.status === "healthy"
        ? 200
        : healthResult.status === "degraded"
          ? 200 // Still operational
          : 503; // Not operational

    return NextResponse.json(healthResult, {
      status: httpStatus,
      headers: HEALTH_SECURITY_HEADERS,
    });
  } catch (error) {
    logger.error("Health check failed", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "1.0.0",
        error: "Health check failed",
      },
      {
        status: 503,
        headers: HEALTH_SECURITY_HEADERS,
      },
    );
  }
}

/**
 * HEAD /api/health
 *
 * Ultra-fast health check for load balancers.
 * Returns 200 if service is up, 503 if down.
 */
export async function HEAD() {
  try {
    const healthResult = await performHealthCheck();

    // Return 503 if unhealthy
    const status = healthResult.status === "unhealthy" ? 503 : 200;

    return new NextResponse(null, {
      status,
      headers: HEAD_SECURITY_HEADERS,
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: HEAD_SECURITY_HEADERS,
    });
  }
}
