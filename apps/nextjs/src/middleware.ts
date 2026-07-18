/**
 * Next.js Edge Middleware
 *
 * Provides edge-level security headers, request tracing, and
 * authentication via Clerk at the edge for all matching routes.
 *
 * Features:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.) applied to all responses
 * - Request ID header for distributed tracing
 * - Clerk authentication via re-exported middleware from utils/clerk
 * - i18n locale detection and redirect
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  HTTP_SECURITY_HEADERS,
  getMinifiedCSPHeader,
} from "@saasfly/common";
import { CUSTOM_HEADERS } from "@saasfly/common/config/headers";

// Re-export the Clerk auth middleware which handles:
// - Authentication checks and redirects
// - Public route detection
// - i18n locale detection and redirect
// - Webhook route passthrough
import { middleware as clerkAuthMiddleware } from "~/utils/clerk";

/**
 * Apply security headers to a NextResponse
 * Adds CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy, Permissions-Policy, and request tracing headers.
 */
function applySecurityHeaders(response: NextResponse, requestId: string): void {
  // Content Security Policy - restricts resource loading to trusted sources
  response.headers.set(
    "Content-Security-Policy",
    getMinifiedCSPHeader(),
  );

  // HSTS - enforce HTTPS connections
  response.headers.set(
    "Strict-Transport-Security",
    HTTP_SECURITY_HEADERS.HSTS,
  );

  // X-Frame-Options - prevent clickjacking
  response.headers.set(
    "X-Frame-Options",
    HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  );

  // X-Content-Type-Options - prevent MIME type sniffing
  response.headers.set(
    "X-Content-Type-Options",
    HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  );

  // Referrer-Policy - control referrer information
  response.headers.set(
    "Referrer-Policy",
    HTTP_SECURITY_HEADERS.REFERRER_POLICY,
  );

  // Permissions-Policy - restrict browser features
  response.headers.set(
    "Permissions-Policy",
    HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY,
  );

  // X-DNS-Prefetch-Control - DNS prefetching hint
  response.headers.set(
    "X-DNS-Prefetch-Control",
    HTTP_SECURITY_HEADERS.DNS_PREFETCH_CONTROL,
  );

  // Request ID for distributed tracing
  response.headers.set(CUSTOM_HEADERS.X_REQUEST_ID, requestId);
}

/**
 * Next.js Middleware — Executes on every matching request at the edge.
 *
 * 1. Generates a request ID for tracing
 * 2. Delegates to Clerk middleware for auth and i18n
 * 3. Applies security headers to all responses
 */
export default async function middleware(request: NextRequest) {
  // Generate a unique request ID for tracing
  const requestId = crypto.randomUUID();

  // Inject request ID into request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CUSTOM_HEADERS.X_REQUEST_ID, requestId);

  // Clone request with added tracing header
  const requestWithId = new NextRequest(request, {
    headers: requestHeaders,
  });

  // Run Clerk auth middleware (handles auth checks, i18n redirects, etc.)
  const response = await clerkAuthMiddleware(requestWithId);

  // If Clerk returned a response (redirect, rewrite, or next), add security headers
  if (response) {
    applySecurityHeaders(response, requestId);
  }

  return response;
}

/**
 * Middleware matcher configuration
 *
 * Excludes static assets, Next.js internals, and common image formats
 * to avoid unnecessary edge function invocations.
 */
export const config = {
  matcher: [
    // Match all routes except static files, Next.js internals, and common assets
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|css|js)$).*)",
  ],
};
