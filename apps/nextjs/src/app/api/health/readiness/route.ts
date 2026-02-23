import { NextResponse } from "next/server";

import { HTTP_SECURITY_HEADERS } from "@saasfly/common";
import { db } from "@saasfly/db";

import { logger } from "~/lib/logger";

/**
 * Readiness probe endpoint for Kubernetes and load balancers.
 *
 * Unlike the liveness probe (/api/health), this endpoint checks if the
 * application can serve traffic by verifying critical dependencies:
 * - Database connectivity
 *
 * Returns 200 if all dependencies are healthy, 503 otherwise.
 * This allows Kubernetes to route traffic only to ready pods.
 *
 * No authentication - intentionally public for fast health monitoring.
 */

const READINESS_SECURITY_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Content-Type": "application/json",
  "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
} as const;

interface HealthCheckResult {
  name: string;
  status: "healthy" | "unhealthy";
  latency?: number;
  error?: string;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await db.selectFrom("User").select(db.fn.count("id").as("count")).execute();
    const latency = Date.now() - start;

    return {
      name: "database",
      status: "healthy",
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error";

    logger.error("Database health check failed", error, { latency });

    return {
      name: "database",
      status: "unhealthy",
      latency,
      error: errorMessage,
    };
  }
}

/**
 * GET /api/health/readiness
 *
 * Returns detailed health status of all dependencies.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    const checks = await Promise.all([checkDatabase()]);

    const totalLatency = Date.now() - startTime;
    const allHealthy = checks.every((check) => check.status === "healthy");

    const response = {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      checks: checks.reduce(
        (acc, check) => ({
          ...acc,
          [check.name]: {
            status: check.status,
            ...(check.latency !== undefined && { latency: check.latency }),
            ...(check.error && { error: check.error }),
          },
        }),
        {} as Record<string, { status: string; latency?: number; error?: string }>,
      ),
    };

    return NextResponse.json(response, {
      status: allHealthy ? 200 : 503,
      headers: READINESS_SECURITY_HEADERS,
    });
  } catch (error) {
    const totalLatency = Date.now() - startTime;
    logger.error("Readiness check failed unexpectedly", error, {
      latency: totalLatency,
    });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        latency: totalLatency,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 503,
        headers: READINESS_SECURITY_HEADERS,
      },
    );
  }
}

/**
 * HEAD /api/health/readiness
 *
 * Lightweight check for load balancers that only need status code.
 */
export async function HEAD() {
  try {
    const checks = await Promise.all([checkDatabase()]);
    const allHealthy = checks.every((check) => check.status === "healthy");

    return new NextResponse(null, {
      status: allHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
        "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
        "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
      },
    });
  }
}
