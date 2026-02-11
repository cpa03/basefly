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
 * - Respects user's motion preferences via motion-safe
 * - Accessible with proper aria attributes
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
function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        shimmer && [
          // Base shimmer animation
          "motion-safe:animate-shimmer",
          // Gradient overlay that creates the shine effect
          "after:absolute after:inset-0",
          "after:bg-gradient-to-r after:from-transparent after:via-muted-foreground/10 after:to-transparent",
          "after:translate-x-[-100%] motion-safe:after:animate-shimmer-sweep",
        ],
        className,
      )}
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
