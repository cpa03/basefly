/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import React from "react";
import Link from "next/link";

import { StatusBadge } from "@saasfly/ui/status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@saasfly/ui/table";

import { EmptyPlaceholder } from "~/components/empty-placeholder";
import { K8sCreateButton } from "~/components/k8s/cluster-create-button";
import { ClusterItem } from "~/components/k8s/cluster-item";
import { ClusterOperations } from "~/components/k8s/cluster-operation";
import type { Locale } from "~/config/i18n-config";
import { formatDate } from "~/lib/utils";
import { trpc } from "~/trpc/server";
import type { BusinessDictionary } from "~/lib/get-dictionary";

interface ClusterListProps {
  lang: Locale;
  dict: BusinessDictionary;
}

export async function ClusterList({ lang, dict }: ClusterListProps) {
  const clusters = (await trpc.k8s.getClusters()) ?? [];

  if (!clusters.length) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="Cluster" />
        <EmptyPlaceholder.Title>
          {dict.k8s.no_cluster_title}
        </EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          {dict.k8s.no_cluster_content}
        </EmptyPlaceholder.Description>
        <K8sCreateButton
          variant="outline"
          dict={dict}
          lang={lang}
        />
      </EmptyPlaceholder>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden divide-y divide-border rounded-md border md:block">
        <div className="flex items-center justify-between p-4">
          <Table className="divide-y divide-gray-200">
            <TableCaption>
              {dict.common.dashboard.table_caption}
            </TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-gray-50">
                <TableHead scope="col" className="w-[100px]">
                  {dict.common.dashboard.col_name}
                </TableHead>
                <TableHead scope="col">
                  {dict.common.dashboard.col_location}
                </TableHead>
                <TableHead scope="col">
                  {dict.common.dashboard.col_updated_at}
                </TableHead>
                <TableHead scope="col">
                  {dict.common.dashboard.col_plan}
                </TableHead>
                <TableHead scope="col">
                  {dict.common.dashboard.col_status}
                </TableHead>
                <TableHead scope="col" className="text-right">
                  {dict.common.dashboard.col_actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clusters.map((cluster) => (
                <ClusterItem
                  key={String(cluster.id)}
                  cluster={cluster}
                  lang={lang}
                  dict={dict}
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
                dict={dict}
              />
            </div>
            <div className="flex flex-wrap gap-4 border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {dict.common.dashboard.label_plan}
                </span>
                <span className="font-medium">{cluster.plan ?? "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {dict.common.dashboard.label_status}
                </span>
                {cluster.status ? (
                  <StatusBadge status={cluster.status} size="sm" />
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {dict.common.dashboard.label_updated}
                </span>
                <span className="font-medium">
                  {formatDate(cluster.updatedAt)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
