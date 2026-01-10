import * as React from "react";

import { Check, Clock, PauseCircle, XCircle, Loader2 as SpinnerLoader } from "@saasfly/ui/icons";

import { cn } from "@saasfly/ui";

export type ClusterStatus = "PENDING" | "CREATING" | "INITING" | "RUNNING" | "STOPPED" | "DELETED";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: ClusterStatus;
  size?: "sm" | "default" | "lg";
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    variant: "secondary" as const,
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    dotColor: "bg-slate-400",
  },
  CREATING: {
    icon: SpinnerLoader,
    label: "Creating",
    variant: "secondary" as const,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    animate: true,
  },
  INITING: {
    icon: SpinnerLoader,
    label: "Initializing",
    variant: "secondary" as const,
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    animate: true,
  },
  RUNNING: {
    icon: Check,
    label: "Running",
    variant: "default" as const,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  STOPPED: {
    icon: PauseCircle,
    label: "Stopped",
    variant: "secondary" as const,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  DELETED: {
    icon: XCircle,
    label: "Deleted",
    variant: "destructive" as const,
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

export function StatusBadge({
  status,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        config.bgColor,
        config.textColor,
        styles.container,
        className
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
          config.animate && "animate-pulse"
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
}
