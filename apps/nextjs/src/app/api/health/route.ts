import { NextResponse } from "next/server";

/**
 * Health check endpoint for Kubernetes probes and load balancers.
 * No authentication - intentionally public for fast health monitoring.
 */
export const runtime = "edge";

export function GET() {
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
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
