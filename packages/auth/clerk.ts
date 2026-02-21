import { auth } from "@clerk/nextjs/server";

import { isAdminEmail } from "@saasfly/common";

import { logger } from "./logger";

export function isClerkEnabled(): boolean {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(
    clerkKey &&
    !clerkKey.includes("dummy") &&
    !clerkKey.includes("placeholder") &&
    clerkKey.startsWith("pk_") &&
    clerkKey.length > 20
  );
}

export async function getSessionUser() {
  if (!isClerkEnabled()) {
    return null;
  }

  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.user?.email) {
      sessionClaims.user.isAdmin = isAdminEmail(sessionClaims.user.email);
    }
    return sessionClaims?.user;
  } catch (error) {
    logger.error("Clerk session retrieval failed", error);
    return null;
  }
}
