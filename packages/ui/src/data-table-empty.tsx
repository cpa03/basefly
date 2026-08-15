"use client";

import * as React from "react";

import { ANIMATION, DATA_TABLE_EMPTY_TOKENS } from "@saasfly/common";

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
        <div className={cn(DATA_TABLE_EMPTY_TOKENS.iconWrapper.base)}>
          <Search
            className={cn(DATA_TABLE_EMPTY_TOKENS.iconWrapper.iconSize)}
            aria-hidden="true"
          />
        </div>
      ),
      [],
    );

    const computedAriaLabel =
      title.trim().length > 0
        ? `Empty state: ${title}`
        : DATA_TABLE_EMPTY_TOKENS.defaultAriaLabel;

    return (
      <td
        ref={ref as React.Ref<HTMLTableCellElement>}
        colSpan={colSpan}
        className={cn(DATA_TABLE_EMPTY_TOKENS.cell, className)}
        {...props}
      >
        <div
          className={cn(
            DATA_TABLE_EMPTY_TOKENS.container.base,
            DATA_TABLE_EMPTY_TOKENS.container.hoverScale,
            DATA_TABLE_EMPTY_TOKENS.container.activeScale,
            "animate-in fade-in-50 zoom-in-95 motion-reduce:animate-none",
            ANIMATION.duration.medium,
            ANIMATION.easing.default,
          )}
          role="status"
          aria-label={computedAriaLabel}
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
          <div className={cn(DATA_TABLE_EMPTY_TOKENS.contentWrapper)}>
            {/* Title */}
            <h3 className={cn(DATA_TABLE_EMPTY_TOKENS.title)}>
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className={cn(DATA_TABLE_EMPTY_TOKENS.description)}>
                {description}
              </p>
            )}

            {/* Action */}
            {action && (
              <div className={cn(DATA_TABLE_EMPTY_TOKENS.action)}>
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
