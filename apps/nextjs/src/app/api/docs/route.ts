import { NextResponse, type NextRequest } from "next/server";

import { getLimiter } from "@saasfly/api";
import { openApiDocument } from "@saasfly/api/openapi";
import { HTTP_STATUS, HTTP_SECURITY_HEADERS } from "@saasfly/common";

/**
 * OpenAPI specification endpoint.
 *
 * Returns the OpenAPI 3.0 specification for the Basefly API.
 * When accessed via browser (Accept: text/html), renders an
 * interactive API reference using Scalar.
 *
 * This can be used with:
 * - Scalar (built-in interactive UI)
 * - Swagger UI / ReDoc (import spec URL)
 * - API clients (curl, Postman, etc.)
 *
 * GET /api/docs  → JSON spec (API clients)
 * GET /api/docs  → HTML UI (browsers)
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

/**
 * Scalar API Reference HTML template.
 * Renders the OpenAPI spec in an interactive, browser-based UI.
 */
const SCALAR_CDN = "https://cdn.jsdelivr.net/npm/@scalar/api-reference";

function renderScalarHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Basefly API Reference</title>
  <meta name="description" content="Enterprise-grade SaaS API for Kubernetes cluster management with subscription billing" />
  <meta name="robots" content="noindex, nofollow" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #app { width: 100%; height: 100%; }
  </style>
  <script src="${SCALAR_CDN}" defer></script>
</head>
<body>
  <div id="app" />
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      ScalarReferences("#app", {
        spec: { url: "${baseUrl}/api/docs" },
        theme: "purple",
        darkMode: true,
        showSidebar: true,
        hideDownloadButton: false,
        searchHotKey: "k",
      });
    });
  </script>
</body>
</html>`;
}

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
          "Content-Type": "application/json",
          "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
          "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
          ...getRateLimitHeaders(rateLimitResult),
          "Retry-After": Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  const accept = req.headers.get("accept") ?? "";

  if (accept.includes("text/html")) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const html = renderScalarHtml(baseUrl);

    return new NextResponse(html, {
      status: HTTP_STATUS.OK,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
        ...getRateLimitHeaders(rateLimitResult),
      },
    });
  }

  return NextResponse.json(openApiDocument, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
      ...getRateLimitHeaders(rateLimitResult),
    },
  });
}
