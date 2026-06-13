/**
 * Next.js Middleware Entry Point
 *
 * Wires up the proxy handler (security headers, CSRF protection,
 * i18n routing, Clerk authentication) as the actual Next.js middleware.
 *
 * Next.js App Router runs this middleware on every matched request
 * BEFORE the route handler. See proxy.ts for the implementation.
 */
export { default as middleware } from "./proxy";
export { config } from "./proxy";
