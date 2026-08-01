"use client";

import { useRouter } from "next/navigation";

import { Button } from "@saasfly/ui/button";

/**
 * Root Not Found Page
 *
 * Custom 404 page rendered for any unmatched route in the application.
 * Falls back to a consistent branded experience instead of the default
 * Next.js 404 page.
 *
 * Note: This is a client component because the root `/_not-found` route is
 * statically prerendered, and Radix Slot (`Button asChild` + `next/link`)
 * fails during that prerender. `useRouter` navigation avoids a full reload.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h2 className="text-2xl font-bold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Home
        </Button>
        <Button variant="default" onClick={() => router.push("/dashboard")}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
