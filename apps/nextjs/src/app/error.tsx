"use client";

import { useEffect } from "react";

import { Button } from "@saasfly/ui/button";

import { logger } from "~/lib/logger";

/**
 * Root Error Boundary
 *
 * This error boundary catches unexpected errors in the root layout's children.
 * It provides a fallback UI when route-level error boundaries are not set up.
 *
 * Note: This does not replace global-error.tsx which handles errors in the
 * root layout itself. Both files are needed for complete error coverage.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root layout error", error, {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
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
          onClick={() => (window.location.href = "/")}
          variant="outline"
        >
          Go to homepage
        </Button>
      </div>
    </div>
  );
}
