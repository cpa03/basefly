import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { HTTP_SECURITY_HEADERS } from "@saasfly/common";

/**
 * Security headers to apply to all responses
 * These are applied at the edge for maximum security
 */
const SECURITY_HEADERS = {
  [HTTP_SECURITY_HEADERS.HSTS]: HTTP_SECURITY_HEADERS.HSTS,
  [HTTP_SECURITY_HEADERS.FRAME_OPTIONS]: HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  [HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS]:
    HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  [HTTP_SECURITY_HEADERS.REFERRER_POLICY]:
    HTTP_SECURITY_HEADERS.REFERRER_POLICY,
  [HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY]:
    HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY,
  [HTTP_SECURITY_HEADERS.DNS_PREFETCH_CONTROL]:
    HTTP_SECURITY_HEADERS.DNS_PREFETCH_CONTROL,
  // Additional security headers
  "X-XSS-Protection": "1; mode=block",
  "X-Download-Options": "noopen",
  "X-Permitted-Cross-Domain-Policies": "none",
} as const;

/**
 * Paths that should bypass authentication checks
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/webhooks",
  "/api/trpc",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
] as const;

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Next.js Middleware
 *
 * Applies security headers to all responses and handles
 * authentication redirects at the edge for maximum performance.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = generateRequestId();

  // Create response
  const response = NextResponse.next();

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID for tracing
  response.headers.set("X-Request-ID", requestId);

  // Add timestamp for logging
  response.headers.set("X-Request-Timestamp", new Date().toISOString());

  // For public paths, return early with security headers
  if (isPublicPath(pathname)) {
    return response;
  }

  // For protected paths, we could add authentication checks here
  // Clerk middleware can be added later if needed

  return response;
}

/**
 * Configure which paths this middleware will run on
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
