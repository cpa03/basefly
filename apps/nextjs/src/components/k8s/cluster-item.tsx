import React from "react";
import Link from "next/link";

import { ANIMATION, FEEDBACK_TIMING } from "@saasfly/common";
import { StatusBadge } from "@saasfly/ui/status-badge";
import { TableCell, TableRow } from "@saasfly/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";

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

const ClusterNameCell = React.memo(function ClusterNameCell({
  name,
  href,
}: {
  name: string;
  href: string;
}) {
  return (
    <TooltipProvider delayDuration={FEEDBACK_TIMING.tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={`inline-block max-w-[200px] truncate font-semibold transition-all ${ANIMATION.duration.fast} ${ANIMATION.easing.default} rounded-sm hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            aria-label={`Edit cluster: ${name}`}
          >
            {name}
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={8}
          className={`${ANIMATION.duration.fast} ${ANIMATION.easing.default}`}
        >
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">Click to edit cluster</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export const ClusterItem = React.memo(function ClusterItem({
  cluster,
  lang,
  dict,
}: ClusterItemProps) {
  const clusterUrl = `/${lang}/editor/cluster/${String(cluster.id)}`;

  return (
    <TableRow
      key={String(cluster.id)}
      className={`transition-colors ${ANIMATION.duration.fast} ${ANIMATION.easing.default} hover:bg-muted/50`}
    >
      <TableCell className="font-medium">
        <ClusterNameCell name={cluster.name} href={clusterUrl} />
      </TableCell>
      <TableCell className="text-left">
        <span
          className={`inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-sm text-secondary-foreground`}
        >
          {cluster.location}
        </span>
      </TableCell>
      <TableCell className="text-left">
        <time
          dateTime={cluster.updatedAt?.toString()}
          className="text-sm text-muted-foreground"
        >
          {formatDate(cluster.updatedAt)}
        </time>
      </TableCell>
      <TableCell className="text-left">
        {cluster.plan ? (
          <span className="inline-flex items-center text-sm font-medium">
            {cluster.plan}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-left">
        {cluster.status ? (
          <StatusBadge status={cluster.status} size="sm" />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <ClusterOperations
          cluster={{ id: cluster.id, name: cluster.name }}
          lang={lang}
          dict={dict}
        />
      </TableCell>
    </TableRow>
  );
});
