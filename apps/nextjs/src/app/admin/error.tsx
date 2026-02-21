"use client";

import { useEffect } from "react";

import { Button } from "@saasfly/ui/button";

import { logger } from "~/lib/logger";

/**
 * Admin Error Boundary
 *
 * This component catches unexpected errors in the admin dashboard.
 * It provides a friendly error UI and logs errors for debugging.
 *
 * This is a reliability improvement that ensures admin users always see a
 * friendly error page instead of a blank screen or raw error message.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Admin dashboard error", error, {
      digest: error.digest,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground">
          An error occurred in the admin dashboard.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button
          onClick={() => (window.location.href = "/admin/dashboard")}
          variant="outline"
        >
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}
