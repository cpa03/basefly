import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js Middleware
 *
 * Provides request-level security and authentication:
 * - Clerk authentication via clerkMiddleware
 * - Request logging for observability
 *
 * Location: apps/nextjs/src/middleware.ts
 *
 * Note: This middleware runs before each request reaches the server.
 * Heavy operations here can impact response time.
 */

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/trpc/auth(.*)",
  "/api/webhooks(.*)",
  "/api/health(.*)",
]);

// Export Clerk middleware configuration
// This handles authentication for protected routes
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Configure which paths the middleware runs on
export const config = {
  // Matcher runs the middleware on all routes except:
  // - _next/static (static files)
  // - _next/image (image optimization)
  // - favicon.ico (favicon)
  // - public files (public directory)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory files
     * - api/health (health check)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)",
  ],
};
