"use client";

import { SignInClerkModal } from "~/components/sign-in-modal-clerk";
import { useMounted } from "~/hooks/use-mounted";

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

export const ModalProvider = ({ dict }: { dict: Record<string, string> }) => {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return <>{isClerkEnabled() && <SignInClerkModal dict={dict} />}</>;
};
