"use client";

import { useEffect } from "react";

import { Button } from "@saasfly/ui/button";

import { useClientDictionary } from "~/hooks/use-client-dictionary";
import { logger } from "~/lib/logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dict, isLoading } = useClientDictionary();

  useEffect(() => {
    logger.error("Dashboard error", error, { digest: error.digest });
  }, [error]);

  const errors = dict?.common?.errors as
    | {
        title?: string;
        dashboard_error?: string;
        try_again?: string;
      }
    | undefined;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          {isLoading ? "Something went wrong!" : (errors?.title ?? "Something went wrong!")}
        </h2>
        <p className="text-muted-foreground">
          {isLoading
            ? "An error occurred while loading the dashboard."
            : (errors?.dashboard_error ?? "An error occurred while loading the dashboard.")}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        {isLoading ? "Try again" : (errors?.try_again ?? "Try again")}
      </Button>
    </div>
  );
}
