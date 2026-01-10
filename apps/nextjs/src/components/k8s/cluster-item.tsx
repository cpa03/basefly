import Link from "next/link";

import { TableBody, TableCell, TableRow } from "@saasfly/ui/table";
import { StatusBadge } from "@saasfly/ui/status-badge";

import { ClusterOperations } from "~/components/k8s/cluster-operation";
import { formatDate } from "~/lib/utils";
import type { Cluster } from "~/types/k8s";

interface ClusterItemProps {
  cluster: Pick<Cluster, "id" | "name" | "location" | "plan" | "status" | "updatedAt">;
}

export function ClusterItem({ cluster }: ClusterItemProps) {
  return (
    <TableBody className="divide-y divide-gray-100">
      <TableRow key={String(cluster.id)}>
        <TableCell className="font-medium">
          <Link
            href={`/editor/cluster/${String(cluster.id)}`}
            className="font-semibold hover:underline"
          >
            {cluster.name}
          </Link>
        </TableCell>
        <TableCell className="text-left">{cluster.location}</TableCell>
        <TableCell className="text-left">
          {formatDate(cluster.updatedAt?.toDateString())}
        </TableCell>
        <TableCell className="text-left">{cluster.plan || "-"}</TableCell>
        <TableCell className="text-left">
          {cluster.status ? (
            <StatusBadge status={cluster.status} size="sm" />
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          {/*<k post={{ id: cluster.id, name: cluster.name }} />*/}
          <ClusterOperations cluster={{ id: cluster.id, name: cluster.name }} />
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
