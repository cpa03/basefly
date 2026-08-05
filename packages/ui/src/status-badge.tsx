import * as React from "react";
import { motion } from "framer-motion";

import {
  BADGE_TOKENS,
  FEEDBACK_TIMING,
  CLUSTER_STATUS_DETAILS,
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

const statusIcons: Record<ClusterStatus, typeof Clock> = {
  PENDING: Clock,
  CREATING: SpinnerLoader,
  INITING: SpinnerLoader,
  RUNNING: Check,
  STOPPED: PauseCircle,
  DELETED: XCircle,
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

interface StatusBadgeProps
  extends Omit<
    React.ComponentProps<"div">,
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onDragEnter"
    | "onDragOver"
    | "onDragLeave"
    | "onDragExit"
    | "onDragTransitionEnd"
    | "onPan"
    | "onPanStart"
    | "onPanEnd"
    | "onPanSessionStart"
    | "onTap"
    | "onTapStart"
    | "onTapCancel"
    | "onHoverStart"
    | "onHoverEnd"
  > {
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
  const config = CLUSTER_STATUS_DETAILS[status];
  const Icon = statusIcons[status] ?? Clock;
  const styles = sizeStyles[size];

  const badge = (
    <motion.div
      whileHover={{ y: -1, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center font-medium transition-colors cursor-pointer",
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
