import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { i18n } from "~/config/i18n-config";

/**
 * Edge Middleware for Next.js
 *
 * This middleware handles:
 * - Clerk authentication via clerkMiddleware
 * - Security headers applied at edge level for better performance
 * - Locale-based routing
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

// Define security headers to apply at edge level
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

// Routes to skip security headers
const SKIP_HEADER_ROUTES = ["/api/trpc", "/api/webhooks", "/_next"];

/**
 * Check if route should skip security headers
 */
function shouldSkipSecurityHeaders(pathname: string): boolean {
  return SKIP_HEADER_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });

  return response;
}

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/(en|zh|ja|ko)/signin(.*)",
  "/(en|zh|ja|ko)/signup(.*)",
  "/(en|zh|ja|ko)/terms(.*)",
  "/(en|zh|ja|ko)/privacy(.*)",
  "/(en|zh|ja|ko)/docs(.*)",
  "/(en|zh|ja|ko)/blog(.*)",
  "/(en|zh|ja|ko)/pricing(.*)",
  "/(en|zh|ja|ko)$",
]);

/**
 * Main middleware function
 *
 * Uses clerkMiddleware for authentication and applies security headers.
 */
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Skip security headers for certain routes
  if (shouldSkipSecurityHeaders(pathname)) {
    // Still run auth for these routes but don't add headers
    return NextResponse.next();
  }

  // Get auth state
  const { userId } = await auth();
  const isAuth = !!userId;

  // Check if it's a public route
  const isPublic = isPublicRoute(req);

  // If not authenticated and not public, redirect to sign in
  if (!isAuth && !isPublic) {
    const locale = i18n.defaultLocale;
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/${locale}/signin?from=${encodeURIComponent(from)}`, req.url),
    );
  }

  // Apply security headers to response
  const response = NextResponse.next();
  return applySecurityHeaders(response);
});

/**
 * Matcher configuration
 *
 * Specifies which routes the middleware should run on.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};
