"use client";

import { useEffect } from "react";

import { Button } from "@saasfly/ui/button";

import { logger } from "~/lib/logger";

/**
 * Global Error Boundary
 *
 * This component catches unexpected errors in the root layout.
 * It replaces the entire root layout when an error occurs, so it must
 * define its own <html> and <body> tags.
 *
 * This is a reliability improvement that ensures users always see a
 * friendly error page instead of a blank screen or raw error message.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global uncaught error", error, {
      digest: error.digest,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-8">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Something went wrong
            </h1>
            <p className="max-w-md text-muted-foreground">
              An unexpected error occurred. Our team has been notified and is
              working to fix the issue.
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
      </body>
    </html>
  );
}
