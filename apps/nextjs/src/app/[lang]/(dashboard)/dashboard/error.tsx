"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AlertCircle, RefreshCw } from "@saasfly/ui/icons";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <DashboardShell>
      <DashboardHeader heading="Error" text="Something went wrong loading your dashboard." />
      <EmptyPlaceholder>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
        </div>
        <EmptyPlaceholder.Title>Unable to load dashboard</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          We encountered an error while loading your dashboard. This might be a temporary issue.
        </EmptyPlaceholder.Description>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Try loading the dashboard again"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go home
          </Link>
        </div>
      </EmptyPlaceholder>
    </DashboardShell>
  );
}
