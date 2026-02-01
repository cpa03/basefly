import type { NextRequest } from "next/server";
import { middleware as clerkMiddleware } from "./utils/clerk";
import { getOrGenerateRequestId, REQUEST_ID_HEADER } from "@saasfly/api/request-id";

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
  img-src 'self' blob: data: https://*.unsplash.com https://*.githubusercontent.com https://*.twil.lol https://*.twillot.com https://*.setupyourpay.com https://cdn.sanity.io https://*.twimg.com;
  font-src 'self' data: cdn.jsdelivr.net;
  connect-src 'self' https://*.clerk.accounts.dev https://*.stripe.com https://api.stripe.com https://*.posthog.com;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`

const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

/**
 * Next.js middleware that wraps Clerk middleware with request ID injection
 * 
 * - Generates or extracts request ID from request headers
 * - Adds request ID to response headers for client visibility
 * - Passes request ID to tRPC context via request headers
 * - Enables distributed tracing across all requests
 * - Adds Content-Security-Policy header for XSS protection
 */
export default async function middleware(req: NextRequest) {
  const requestId = getOrGenerateRequestId(req.headers);
  
  const result = await clerkMiddleware(req);

  if (result && typeof result === 'object' && 'headers' in result) {
    result.headers.set(REQUEST_ID_HEADER, requestId);
    result.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
  }

  return result;
}
