import { NextResponse, type NextRequest } from "next/server";

import {
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api/request-id";
import { getMinifiedCSPHeader } from "@saasfly/common";

import { middleware as clerkMiddleware } from "./utils/clerk";

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

// Use centralized CSP configuration from @saasfly/common
const contentSecurityPolicyHeaderValue = getMinifiedCSPHeader();

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key.includes("dummy") || key.includes("placeholder")) return false;
  if (!key.startsWith("pk_")) return false;
  return key.length > 20;
}

function createErrorResponse(
  req: NextRequest,
  requestId: string,
  error: unknown,
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        error: "Middleware Error",
        message: errorMessage,
        requestId,
      },
      {
        status: 500,
        headers: {
          [REQUEST_ID_HEADER]: requestId,
          "Content-Security-Policy": contentSecurityPolicyHeaderValue,
        },
      },
    );
  }

  return NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });
}

/**
 * Next.js proxy middleware that wraps Clerk middleware with request ID injection
 *
 * - Generates or extracts request ID from request headers
 * - Adds request ID to response headers for client visibility
 * - Passes request ID to tRPC context via request headers
 * - Enables distributed tracing across all requests
 * - Adds Content-Security-Policy header for XSS protection
 * - Gracefully handles Clerk initialization errors in development
 */
export default async function proxy(
  req: NextRequest,
): Promise<Response | null> {
  const requestId = getOrGenerateRequestId(req.headers);
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  try {
    if (!isValidClerkKey(clerkKey)) {
      const response = NextResponse.next({
        request: {
          headers: new Headers(req.headers),
        },
      });
      response.headers.set(REQUEST_ID_HEADER, requestId);
      response.headers.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
      );
      return response;
    }

    const result = await (
      clerkMiddleware as (req: NextRequest) => Promise<Response | null>
    )(req);

    if (result && typeof result === "object" && "headers" in result) {
      result.headers.set(REQUEST_ID_HEADER, requestId);
      result.headers.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
      );
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return createErrorResponse(req, requestId, error);
    }
    throw error;
  }
}
