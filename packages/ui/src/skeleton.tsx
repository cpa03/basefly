import { SKELETON_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the shimmer animation effect
   * @default true
   */
  shimmer?: boolean;
}

/**
 * Skeleton - A loading placeholder component with shimmer animation
 *
 * Features:
 * - Smooth shimmer animation that sweeps across the placeholder
 * - Respects user's motion preferences via motion-safe and motion-reduce
 * - Accessible with proper aria attributes and SKELETON_TOKENS integration
 * - Customizable via className
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton className="h-4 w-[250px]" />
 *
 * // Without shimmer (static)
 * <Skeleton shimmer={false} className="h-4 w-[250px]" />
 *
 * // Circular avatar skeleton
 * <Skeleton className="h-12 w-12 rounded-full" />
 *
 * // Card skeleton
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-[250px]" />
 *   <Skeleton className="h-4 w-[200px]" />
 * </div>
 * ```
 */
function Skeleton({
  className,
  shimmer = true,
  role = SKELETON_TOKENS.role,
  "aria-label": ariaLabel = SKELETON_TOKENS.defaultAriaLabel,
  ...props
}: SkeletonProps) {
  return (
    <div
      role={role}
      className={cn(
        SKELETON_TOKENS.base,
        shimmer && [
          SKELETON_TOKENS.shimmer.base,
          SKELETON_TOKENS.shimmer.overlay,
        ],
        className,
      )}
      aria-busy="true"
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
