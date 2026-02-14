import type { NextRequest, NextResponse } from "next/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey =
  clerkKey &&
  !clerkKey.includes("dummy") &&
  !clerkKey.includes("placeholder") &&
  clerkKey.startsWith("pk_") &&
  clerkKey.length > 20;

let clerkMiddleware: typeof import("~/utils/clerk").middleware | null = null;

async function middleware(req: NextRequest): Promise<NextResponse | null> {
  if (isValidClerkKey) {
    if (!clerkMiddleware) {
      const clerkModule = await import("~/utils/clerk");
      clerkMiddleware = clerkModule.middleware;
    }
    return clerkMiddleware(req);
  }
  return null;
}

export { middleware };

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
