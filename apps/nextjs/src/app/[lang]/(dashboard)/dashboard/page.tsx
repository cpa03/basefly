import React, { Suspense } from "react";
// Import aliased: the segment config below exports `const dynamic`, which would
// collide with next/dynamic's `dynamic` binding under Turbopack.
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

import { ClusterList } from "~/components/dashboard/cluster-list";
import { ClusterListSkeleton } from "~/components/dashboard/cluster-list-skeleton";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";

// Lazy-load the interactive cluster creation button (toast + tRPC client) so
// it is split out of the initial dashboard chunk.

const K8sCreateButton = nextDynamic(
  () =>
    import("~/components/k8s/cluster-create-button").then((mod) => ({
      default: mod.K8sCreateButton,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
    ),
  },
);

// Per-user data (clusters scoped to the authenticated user): always server-rendered.
// ISR intentionally not used - `force-dynamic` forces revalidate=0 (Next.js segment
// precedence), and caching user-scoped data would leak it across users.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    lang: Locale;
  }>;
}) {
  const { lang } = await params;
  // Auth check is handled by DashboardLayout, but we still need the user object
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  // Check and create customer if needed
  const customer = await trpc.customer.queryCustomer({
    userId: user.id,
  });
  if (!customer) {

    await trpc.customer.insertCustomer.mutate({
      userId: user.id,
    });
  }

  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
      <DashboardHeader
        heading={dict.common.dashboard.heading}
        text={dict.common.dashboard.title_text}
      >
        <K8sCreateButton dict={dict.business} lang={lang} />
      </DashboardHeader>
      <div>
        <Suspense fallback={<ClusterListSkeleton />}>
          <ClusterList lang={lang} dict={dict.business} />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
