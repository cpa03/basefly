/**
 * Dashboard Configuration
 * Centralized constants and configuration for dashboard UI components
 *
 * This module eliminates hardcoded values and provides a single source of truth
 * for dashboard-related settings, making the UI more maintainable and consistent.
 */

import { ANIMATION, PAGE_SIZES, PAGINATION_LIMITS } from "@saasfly/common";

/**
 * Table column configuration for consistent column widths
 * across different viewports and cluster tables
 */
export const TABLE_COLUMNS = {
  /** Name column - cluster identifier */
  name: {
    minWidth: "150px",
    maxWidth: "250px",
    truncateAt: 200,
  },
  /** Location column - region/zone display */
  location: {
    minWidth: "100px",
    maxWidth: "150px",
  },
  /** Date column - timestamps */
  date: {
    minWidth: "120px",
    maxWidth: "180px",
  },
  /** Plan column - subscription tier */
  plan: {
    minWidth: "80px",
    maxWidth: "120px",
  },
  /** Status column - cluster state indicator */
  status: {
    minWidth: "100px",
    maxWidth: "140px",
  },
  /** Actions column - operation buttons */
  actions: {
    minWidth: "60px",
    maxWidth: "80px",
  },
} as const;

/**
 * Hover and interaction timing for table rows
 * Using centralized animation constants for consistency
 */
export const TABLE_INTERACTIONS = {
  /** Duration of row hover transition */
  hoverTransition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
  /** Background color on hover */
  hoverBackground: "hover:bg-muted/50",
  /** Scale effect on interactive elements within rows */
  elementScale: "hover:scale-[1.02]",
} as const;

/**
 * Tooltip configuration for table cells
 * Ensures consistent tooltip behavior across the dashboard
 */
export const TABLE_TOOLTIPS = {
  /** Delay before tooltip appears (ms) */
  delayDuration: 300,
  /** Distance from trigger element (px) */
  sideOffset: 8,
  /** Default tooltip position */
  defaultSide: "top" as const,
  /** Animation classes */
  animation: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
} as const;

/**
 * Empty state configuration
 * Used by DataTableEmpty and similar components
 */
export const EMPTY_STATES = {
  /** Default icon size */
  iconSize: "h-20 w-20",
  /** Inner icon size */
  innerIconSize: "h-10 w-10",
  /** Animation for icon container */
  iconAnimation: `${ANIMATION.duration.medium} ${ANIMATION.easing.default}`,
  /** Container minimum height */
  minHeight: "min-h-[400px]",
  /** Container padding */
  padding: "p-8",
} as const;

/**
 * Status badge configuration
 * Extends the status-badge component with dashboard-specific settings
 */
export const STATUS_BADGE_CONFIG = {
  /** Default badge size */
  defaultSize: "sm" as const,
  /** Animation for loading states */
  loadingAnimation: "animate-spin",
  /** Size variants */
  sizes: {
    sm: "h-2 w-2",
    default: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  },
} as const;

/**
 * Pagination configuration
 * Uses shared pagination constants from @saasfly/common for consistency
 */
export const PAGINATION_CONFIG = {
  /** Default items per page - uses small page size for dashboard tables */
  defaultPageSize: PAGE_SIZES.small,
  /** Available page size options - derived from shared PAGE_SIZES */
  pageSizeOptions: [PAGE_SIZES.small, PAGE_SIZES.admin, PAGE_SIZES.large, PAGE_SIZES.max],
  /** Maximum visible page buttons - uses shared limit */
  maxVisiblePages: PAGINATION_LIMITS.maxVisiblePages,
} as const;

/**
 * Skeleton loading configuration
 * Used by DashboardSkeleton and related components
 */
export const SKELETON_CONFIG = {
  /** Number of skeleton rows to show */
  defaultRowCount: 5,
  /** Row height */
  rowHeight: "h-12",
  /** Header height */
  headerHeight: "h-10",
  /** Animation pulse */
  animation: "animate-pulse",
  /** Background color */
  background: "bg-muted",
} as const;

/**
 * Dashboard header configuration
 */
export const DASHBOARD_HEADER = {
  /** Header spacing */
  spacing: "space-y-6",
  /** Heading size classes */
  headingSize: "text-3xl font-bold tracking-tight",
  /** Description color */
  descriptionColor: "text-muted-foreground",
} as const;

/**
 * Action button configuration for cluster operations
 */
export const ACTION_BUTTONS = {
  /** Size of action icons */
  iconSize: "h-4 w-4",
  /** Button padding */
  padding: "p-1.5",
  /** Border radius */
  borderRadius: "rounded-md",
  /** Transition */
  transition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
  /** Scale effect */
  hoverScale: "hover:scale-110",
} as const;

/**
 * Filter and search configuration
 */
export const FILTER_CONFIG = {
  /** Debounce delay for search input (ms) */
  searchDebounce: 300,
  /** Minimum characters before triggering search */
  minSearchLength: 2,
  /** Maximum recent filters to remember */
  maxRecentFilters: 5,
} as const;

// Export type definitions for TypeScript support
export type TableColumnKey = keyof typeof TABLE_COLUMNS;
export type PageSizeOption = (typeof PAGINATION_CONFIG.pageSizeOptions)[number];
