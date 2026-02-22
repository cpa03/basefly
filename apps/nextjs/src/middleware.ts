/**
 * Next.js Middleware for Vercel Edge Runtime
 *
 * This middleware handles:
 * - Authentication (Clerk)
 * - Internationalization (i18n routing)
 * - Route protection
 *
 * Edge runtime is automatically enabled for middleware on Vercel.
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { middleware } from "~/utils/clerk";

export const config = {
  matcher: [
    // Match all paths except static files, api routes that don't need auth, and internal Next.js paths
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
};

export default middleware;
