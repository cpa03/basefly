import * as React from "react";

import { type ClusterStatus } from "@saasfly/common";
import {
  Check,
  Clock,
  PauseCircle,
  Loader2 as SpinnerLoader,
  XCircle,
} from "@saasfly/ui/icons";

import { cn } from "./index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface StatusConfig {
  icon: typeof Clock;
  label: string;
  description: string;
  variant: "secondary" | "default" | "destructive";
  bgColor: string;
  textColor: string;
  dotColor: string;
  animate?: boolean;
}

const statusConfig: Record<ClusterStatus, StatusConfig> = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    description: "Cluster creation is queued and waiting to start",
    variant: "secondary",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    dotColor: "bg-slate-400",
  },
  CREATING: {
    icon: SpinnerLoader,
    label: "Creating",
    description: "Cluster infrastructure is being provisioned",
    variant: "secondary",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    animate: true,
  },
  INITING: {
    icon: SpinnerLoader,
    label: "Initializing",
    description: "Cluster is being configured and services are starting",
    variant: "secondary",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    animate: true,
  },
  RUNNING: {
    icon: Check,
    label: "Running",
    description: "Cluster is operational and ready for workloads",
    variant: "default",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  STOPPED: {
    icon: PauseCircle,
    label: "Stopped",
    description: "Cluster is paused and not consuming resources",
    variant: "secondary",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  DELETED: {
    icon: XCircle,
    label: "Deleted",
    description: "Cluster has been marked for deletion",
    variant: "destructive",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

const sizeStyles = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1.5",
    icon: "h-3 w-3",
    dot: "h-1.5 w-1.5",
  },
  default: {
    container: "px-2.5 py-1 text-sm gap-2",
    icon: "h-4 w-4",
    dot: "h-2 w-2",
  },
  lg: {
    container: "px-3 py-1.5 text-base gap-2.5",
    icon: "h-5 w-5",
    dot: "h-2.5 w-2.5",
  },
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: ClusterStatus;
  size?: "sm" | "default" | "lg";
  showTooltip?: boolean;
}

export function StatusBadge({
  status,
  size = "default",
  showTooltip = true,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const styles = sizeStyles[size];

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        config.bgColor,
        config.textColor,
        styles.container,
        className,
      )}
      role="status"
      aria-label={`${config.label} status`}
      {...props}
    >
      <span
        className={cn(
          "rounded-full",
          styles.dot,
          config.dotColor,
          config.animate && "animate-pulse",
        )}
        aria-hidden="true"
      />
      <Icon
        className={cn(styles.icon, config.animate && "animate-spin")}
        aria-hidden="true"
      />
      <span className="sr-only">{config.label}</span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="font-semibold">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
