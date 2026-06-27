import * as React from "react";
import { motion } from "framer-motion";

import {
  BADGE_TOKENS,
  FEEDBACK_TIMING,
  type ClusterStatus,
} from "@saasfly/common";
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
    container: `${BADGE_TOKENS.sizes.sm.padding} ${BADGE_TOKENS.sizes.sm.text} gap-1.5`,
    icon: "h-3 w-3",
    dot: BADGE_TOKENS.sizes.sm.dot,
  },
  default: {
    container: `${BADGE_TOKENS.sizes.default.padding} ${BADGE_TOKENS.sizes.default.text} gap-2`,
    icon: "h-4 w-4",
    dot: BADGE_TOKENS.sizes.default.dot,
  },
  lg: {
    container: `${BADGE_TOKENS.sizes.lg.padding} ${BADGE_TOKENS.sizes.lg.text} gap-2.5`,
    icon: "h-5 w-5",
    dot: BADGE_TOKENS.sizes.lg.dot,
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
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center font-medium transition-colors",
        BADGE_TOKENS.radius,
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
          config.animate && "animate-pulse motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      <Icon
        className={cn(
          styles.icon,
          config.animate && "animate-spin motion-reduce:animate-none",
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{config.label}</span>
    </motion.div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider delayDuration={FEEDBACK_TIMING.tooltipDelay}>
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
