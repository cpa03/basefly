import React, { Suspense } from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

import { ClusterList } from "~/components/dashboard/cluster-list";
import { ClusterListSkeleton } from "~/components/dashboard/cluster-list-skeleton";
import { DashboardHeader } from "~/components/header";
import { K8sCreateButton } from "~/components/k8s/cluster-create-button";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";

export const dynamic = "force-dynamic";
export const revalidate = 60; // ISR: revalidate every 60 seconds

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- tRPC proxy types are dynamically resolved
  const customer = await trpc.customer.queryCustomer({
    userId: user.id,
  });
  if (!customer) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- tRPC proxy types are dynamically resolved
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
