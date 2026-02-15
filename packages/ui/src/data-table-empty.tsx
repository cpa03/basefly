"use client";

import * as React from "react";

import { ANIMATION } from "@saasfly/common";

import { Search } from "./icons";
import { cn } from "./utils/cn";

interface DataTableEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title to display in the empty state
   * @default "No results found"
   */
  title?: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional icon to display. Defaults to Search icon
   */
  icon?: React.ReactNode;
  /**
   * Optional action element (e.g., a button to create new item)
   */
  action?: React.ReactNode;
  /**
   * Number of columns in the table (for proper colspan)
   * @default 1
   */
  colSpan?: number;
}

/**
 * DataTableEmpty - An enhanced empty state component for DataTable
 *
 * Micro-UX Improvements:
 * - Visual icon with hover animation for better engagement
 * - Smooth fade-in animation on appearance (respects reduced motion)
 * - Clear title and optional description for context
 * - Support for custom actions (e.g., "Create new" button)
 * - Proper accessibility with role and aria-label
 * - Consistent styling with border-dashed pattern matching EmptyPlaceholder
 * - Hover effects for interactivity feedback
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DataTableEmpty />
 *
 * // With custom content
 * <DataTableEmpty
 *   title="No clusters found"
 *   description="Get started by creating your first Kubernetes cluster."
 *   action={<Button>Create Cluster</Button>}
 * />
 *
 * // In DataTable
 * <TableCell colSpan={columns.length}>
 *   <DataTableEmpty colSpan={columns.length} />
 * </TableCell>
 * ```
 */
const DataTableEmpty = React.forwardRef<
  HTMLTableCellElement,
  DataTableEmptyProps
>(
  (
    {
      title = "No results found",
      description,
      icon,
      action,
      colSpan = 1,
      className,
      ...props
    },
    ref,
  ) => {
    const defaultIcon = React.useMemo(
      () => (
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-muted",
            "transition-all duration-300 ease-out",
            "group-hover:scale-110 group-hover:bg-muted/80",
            "motion-safe:transition-transform motion-safe:duration-300",
          )}
        >
          <Search
            className={cn(
              "h-8 w-8 text-muted-foreground",
              "transition-colors duration-300",
              "group-hover:text-primary",
            )}
            aria-hidden="true"
          />
        </div>
      ),
      [],
    );

    return (
      <td
        ref={ref as React.Ref<HTMLTableCellElement>}
        colSpan={colSpan}
        className={cn("p-0", className)}
        {...props}
      >
        <div
          className={cn(
            // Layout
            "flex min-h-[280px] flex-col items-center justify-center",
            // Spacing
            "px-8 py-12",
            // Visual styling
            "border-0", // Remove border since we're in a table cell
            "bg-transparent",
            // Animation - fade in with scale
            "animate-in fade-in-50 zoom-in-95",
            "motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-95",
            "motion-reduce:animate-none",
            // Timing
            ANIMATION.duration.medium,
            ANIMATION.easing.default,
            // Group for hover effects
            "group",
          )}
          role="status"
          aria-label={`Empty state: ${title}`}
          aria-live="polite"
        >
          {/* Icon */}
          <div
            className={cn(
              "mb-6",
              "motion-safe:transition-transform motion-safe:duration-300",
              "motion-safe:group-hover:scale-105",
            )}
          >
            {icon ?? defaultIcon}
          </div>

          {/* Content container */}
          <div
            className={cn(
              "mx-auto flex max-w-[400px] flex-col items-center text-center",
              "motion-safe:transition-all motion-safe:duration-300",
              "motion-safe:delay-75",
            )}
          >
            {/* Title */}
            <h3
              className={cn(
                "text-lg font-semibold text-foreground",
                "motion-safe:transition-colors motion-safe:duration-200",
                "group-hover:text-foreground/90",
              )}
            >
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p
                className={cn(
                  "mt-2 text-sm text-muted-foreground",
                  "leading-relaxed",
                  "motion-safe:transition-colors motion-safe:duration-200",
                )}
              >
                {description}
              </p>
            )}

            {/* Action */}
            {action && (
              <div
                className={cn(
                  "mt-6",
                  "motion-safe:transition-all motion-safe:duration-300",
                  "motion-safe:translate-y-0 motion-safe:opacity-100",
                  "motion-safe:delay-100",
                )}
              >
                {action}
              </div>
            )}
          </div>
        </div>
      </td>
    );
  },
);

DataTableEmpty.displayName = "DataTableEmpty";

export { DataTableEmpty, type DataTableEmptyProps };
