import Link from "next/link";

import { Button } from "@saasfly/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">404 - Page Not Found</h2>
        <p className="text-muted-foreground">
          The dashboard page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </Button>
      </div>
    </div>
  );
}
