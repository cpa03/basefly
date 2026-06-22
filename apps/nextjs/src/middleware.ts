/**
 * Next.js Middleware Entry Point
 *
 * Re-exports the proxy handler as Next.js middleware.
 * The proxy module handles i18n routing, CSRF protection, Clerk authentication,
 * and security headers.
 *
 * @see ./proxy.ts for the full middleware implementation
 */
export { default, config } from "./proxy";
