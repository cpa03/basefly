import { NextResponse } from "next/server";

import { logger } from "~/lib/logger";

/**
 * Health check endpoint for Kubernetes probes and load balancers.
 * No authentication - intentionally public for fast health monitoring.
 */

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
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    logger.error("Health check failed", error);
    return NextResponse.json(
      { status: "unhealthy", error: "Health check failed" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export function HEAD() {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}
