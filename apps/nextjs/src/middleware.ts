import type { NextRequest } from "next/server";
import { middleware as clerkMiddleware } from "./utils/clerk";
import { getOrGenerateRequestId, REQUEST_ID_HEADER } from "@saasfly/api/request-id";
import { buildCspHeader } from "@saasfly/common/config/app";

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};

/**
 * Content Security Policy header value
 * Built dynamically from centralized configuration
 */
const contentSecurityPolicyHeaderValue = buildCspHeader();

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

  if (result && typeof result === "object" && "headers" in result) {
    result.headers.set(REQUEST_ID_HEADER, requestId);
    result.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  }

  return result;
}
