import { auth } from "@clerk/nextjs/server";

import { env } from "./env.mjs";

function isClerkEnabled(): boolean {
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
    if (env.ADMIN_EMAIL) {
      const adminEmails = env.ADMIN_EMAIL.split(",");
      if (sessionClaims?.user?.email) {
        sessionClaims.user.isAdmin = adminEmails.includes(
          sessionClaims?.user?.email,
        );
      }
    }
    return sessionClaims?.user;
  } catch {
    return null;
  }
}
