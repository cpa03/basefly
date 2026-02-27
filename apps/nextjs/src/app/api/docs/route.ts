import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getLimiter } from "@saasfly/api";
import { openApiDocument } from "@saasfly/api/openapi";
import { HTTP_STATUS } from "@saasfly/common";

/**
 * OpenAPI specification endpoint.
 *
 * Returns the OpenAPI 3.0 specification for the Basefly API.
 * This can be used with:
 * - Swagger UI
 * - ReDoc
 * - API clients (curl, Postman, etc.)
 *
 * GET /api/docs
 */

// Use read rate limit config: 100 requests per minute
const docsLimiter = getLimiter("read");

/**
 * Rate limit headers to include in responses
 */
const getRateLimitHeaders = (result: {
  limit: number;
  remaining: number;
  resetAt: number;
}) => ({
  "X-RateLimit-Limit": result.limit.toString(),
  "X-RateLimit-Remaining": result.remaining.toString(),
  "X-RateLimit-Reset": result.resetAt.toString(),
});

export function GET(req: NextRequest) {
  // Check rate limit - use IP as identifier for public endpoint
  const forwarded = req.headers.get("x-forwarded-for");
const ip =
    forwarded?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown";
  const identifier = `docs:${ip}`;

  const rateLimitResult = docsLimiter.check(identifier);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: {
          ...getRateLimitHeaders(rateLimitResult),
          "Retry-After": Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  return NextResponse.json(openApiDocument, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      ...getRateLimitHeaders(rateLimitResult),
    },
  });
}
