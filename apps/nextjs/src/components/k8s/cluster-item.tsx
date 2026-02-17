import Link from "next/link";

import { StatusBadge } from "@saasfly/ui/status-badge";
import { TableCell, TableRow } from "@saasfly/ui/table";

import { ClusterOperations } from "~/components/k8s/cluster-operation";
import { formatDate } from "~/lib/utils";
import type { Cluster } from "~/types/k8s";

interface ClusterItemProps {
  cluster: Pick<
    Cluster,
    "id" | "name" | "location" | "plan" | "status" | "updatedAt"
  >;
  lang: string;
  dict?: Record<string, unknown>;
}

export function ClusterItem({ cluster, lang, dict }: ClusterItemProps) {
  return (
    <TableRow key={String(cluster.id)}>
      <TableCell className="font-medium">
        <Link
          href={`/${lang}/editor/cluster/${String(cluster.id)}`}
          className="font-semibold hover:underline"
        >
          {cluster.name}
        </Link>
      </TableCell>
      <TableCell className="text-left">{cluster.location}</TableCell>
      <TableCell className="text-left">
        {formatDate(cluster.updatedAt)}
      </TableCell>
      <TableCell className="text-left">{cluster.plan ?? "-"}</TableCell>
      <TableCell className="text-left">
        {cluster.status ? (
          <StatusBadge status={cluster.status} size="sm" />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {/*<k post={{ id: cluster.id, name: cluster.name }} />*/}
        <ClusterOperations
          cluster={{ id: cluster.id, name: cluster.name }}
          lang={lang}
          dict={dict}
        />
      </TableCell>
    </TableRow>
  );
}
