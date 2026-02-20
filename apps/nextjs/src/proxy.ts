import { NextResponse, type NextRequest } from "next/server";

import {
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api/request-id";
import {
  getMinifiedCSPHeader,
  HEADERS,
  HTTP_STATUS,
} from "@saasfly/common";

import { i18n } from "./config/i18n-config";
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

/**
 * Security headers applied to all middleware responses
 * These complement the headers set in next.config.mjs for defense-in-depth
 */
const SECURITY_HEADERS: Record<string, string> = {
  [HEADERS.X_CONTENT_TYPE_OPTIONS]: "nosniff",
  [HEADERS.X_FRAME_OPTIONS]: "SAMEORIGIN",
  [HEADERS.REFERRER_POLICY]: "origin-when-cross-origin",
  [HEADERS.CONTENT_SECURITY_POLICY]: contentSecurityPolicyHeaderValue,
  // Cross-Origin headers for enhanced security
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Apply security headers to a response
 * Ensures all middleware responses have consistent security headers
 */
function applySecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

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
    const response = NextResponse.json(
      {
        error: "Middleware Error",
        message: errorMessage,
        requestId,
      },
      {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      },
    );
    response.headers.set(REQUEST_ID_HEADER, requestId);
    applySecurityHeaders(response);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });
  applySecurityHeaders(response);
  return response;
}

function handleI18nRouting(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return null;
  }

  const locale = i18n.defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export default async function proxy(
  req: NextRequest,
): Promise<Response | null> {
  const i18nResponse = handleI18nRouting(req);
  if (i18nResponse) {
    return i18nResponse;
  }

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
      applySecurityHeaders(response);
      return response;
    }

    const result = await (
      clerkMiddleware as (req: NextRequest) => Promise<Response | null>
    )(req);

    if (result && typeof result === "object" && "headers" in result) {
      result.headers.set(REQUEST_ID_HEADER, requestId);
      applySecurityHeaders(result as NextResponse);
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return createErrorResponse(req, requestId, error);
    }
    throw error;
  }
}
