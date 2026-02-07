import React from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

export const dynamic = "force-dynamic";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { DashboardHeader } from "~/components/header";
import { K8sCreateButton } from "~/components/k8s/cluster-create-button";
import { ClusterItem } from "~/components/k8s/cluster-item";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";
import Link from "next/link";
import { StatusBadge } from "@saasfly/ui/status-badge";
import { formatDate } from "~/lib/utils";
import { ClusterOperations } from "~/components/k8s/cluster-operation";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
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
  // const accout
  const clusters = (await trpc.k8s.getClusters.query()) ?? [];
  const dict = await getDictionary(lang);

  return (
    <DashboardShell>
        <DashboardHeader
          heading="kubernetes"
          text={dict.common.dashboard.title_text}
        >
          <K8sCreateButton dict={dict.business} lang={lang} />
        </DashboardHeader>
        <div>
          {clusters.length ? (
            <div className="space-y-4">
              <div className="hidden md:block divide-y divide-border rounded-md border">
                <div className="flex items-center justify-between p-4">
                  <Table className="divide-y divide-gray-200">
                    <TableCaption>A list of your k8s cluster</TableCaption>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-50">
                        <TableHead scope="col" className="w-[100px]">Name</TableHead>
                        <TableHead scope="col">Location</TableHead>
                        <TableHead scope="col">UpdatedAt</TableHead>
                        <TableHead scope="col">Plan</TableHead>
                        <TableHead scope="col">Status</TableHead>
                        <TableHead scope="col" className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clusters.map((cluster) => (
                        <ClusterItem
                          key={String(cluster.id)}
                          cluster={cluster}
                          lang={lang}
                          dict={dict.business}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:hidden">
                {clusters.map((cluster) => (
                  <article
                    key={String(cluster.id)}
                    className="flex flex-col gap-3 rounded-md border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          <Link
                            href={`/${lang}/editor/cluster/${String(cluster.id)}`}
                            className="hover:underline"
                          >
                            {cluster.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cluster.location}
                        </p>
                      </div>
                      <ClusterOperations
                        cluster={{ id: cluster.id, name: cluster.name }}
                        lang={lang}
                        dict={dict.business}
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 border-t pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium">{cluster.plan ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        {cluster.status ? (
                          <StatusBadge status={cluster.status} size="sm" />
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="font-medium">{formatDate(cluster.updatedAt?.toDateString())}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <EmptyPlaceholder>
              {/*<EmptyPlaceholder.Icon />*/}
              <EmptyPlaceholder.Title>
                {dict.business.k8s.no_cluster_title}
              </EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                {dict.business.k8s.no_cluster_content}
              </EmptyPlaceholder.Description>
              <K8sCreateButton variant="outline" dict={dict.business} lang={lang} />
            </EmptyPlaceholder>
          )}
        </div>
      </DashboardShell>
  );
}
