import { redirect } from "next/navigation";

import { getCurrentUser } from "@saasfly/auth";
import { isAdminEmail, Z_INDEX } from "@saasfly/common";

import { SkipLink } from "~/components/skip-link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink />
      <header
        className={`sticky top-0 ${Z_INDEX.navbar} border-b bg-background`}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </header>
      <main id="main-content" className="container px-4 py-6">
        {children}
      </main>
    </div>
  );
}
