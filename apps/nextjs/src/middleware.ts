import { NextResponse, type NextRequest } from "next/server";

import {
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api/request-id";
import { getMinifiedCSPHeader, HTTP_STATUS } from "@saasfly/common";

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
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
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

export default async function middleware(
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
