import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

import { DashboardHeader } from "~/components/header";
import { K8sCreateButton } from "~/components/k8s/cluster-create-button";
import { ClusterList } from "~/components/k8s/cluster-list";
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
  const customer = await trpc.customer.queryCustomer.query({
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
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="hidden divide-y divide-border rounded-md border md:block">
                <div className="flex items-center justify-between p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <th
                            key={i}
                            className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                          >
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {Array.from({ length: 6 }).map((_, colIndex) => (
                            <td key={colIndex} className="p-4 align-middle">
                              <div
                                className={`h-5 ${
                                  colIndex === 5 ? "ml-auto w-20" : "w-full max-w-[150px]"
                                } animate-pulse rounded bg-muted`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-md border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 border-t pt-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          {/* @ts-expect-error Server Component */}
          <ClusterList lang={lang} dict={dict} />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
