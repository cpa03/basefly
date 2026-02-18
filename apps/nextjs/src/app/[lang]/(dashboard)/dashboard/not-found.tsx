import Link from "next/link";

import { FileQuestion } from "@saasfly/ui/icons";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";

export default function NotFound() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Not Found"
        text="The page you're looking for doesn't exist."
      />
      <EmptyPlaceholder>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileQuestion
            className="h-10 w-10 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <EmptyPlaceholder.Title>Page not found</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </EmptyPlaceholder.Description>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go to Dashboard
        </Link>
      </EmptyPlaceholder>
    </DashboardShell>
  );
}
