"use client";

import { SignInClerkModal } from "~/components/sign-in-modal-clerk";
import { useMounted } from "~/hooks/use-mounted";
import { SigninModalProvider } from "~/hooks/use-signin-modal";

/**

import { SignInClerkModal } from "~/components/sign-in-modal-clerk";
import { SigninModalProvider } from "~/hooks/use-signin-modal";
import { useMounted } from "~/hooks/use-mounted";

import { SignInClerkModal } from "~/components/sign-in-modal-clerk";
import { useMounted } from "~/hooks/use-mounted";

/**
 * Checks if Clerk authentication is properly configured.
 *
 * Validates the Clerk publishable key to ensure:
 * - Key exists and is not a placeholder/dummy value
 * - Key follows the expected format (starts with "pk_")
 * - Key has sufficient length (>20 characters) to be valid
 *
 * @returns {boolean} True if Clerk is enabled and properly configured
 */
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

/**
 * Modal provider that conditionally renders the Clerk sign-in modal.
 *
 * This component handles:
 * - Client-side mounting to prevent hydration mismatches
 * - Conditional rendering based on Clerk configuration
 *
 * @param {Object} props - Component props
 * @param {Record<string, string>} props.dict - Dictionary for i18n strings
 * @returns {JSX.Element | null} The modal provider component or null if not mounted
 */
export const ModalProvider = ({ dict }: { dict: Record<string, string> }) => {
  const mounted = useMounted();
  if (!mounted) {
    return null;
  }
  return (
    <SigninModalProvider>
      {isClerkEnabled() && <SignInClerkModal dict={dict} />}
    </SigninModalProvider>
  );
};
