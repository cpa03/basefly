/**
 * Centralized Kubernetes Configuration
 *
 * This module provides a single source of truth for all Kubernetes-related
 * configuration values, eliminating hardcoded cluster settings.
 *
 * @module @saasfly/common/config/k8s
 */

/**
 * Available cluster locations/regions
 *
 * These are the geographic locations where Kubernetes clusters can be deployed.
 * Using a readonly array ensures these cannot be modified at runtime.
 */
export const CLUSTER_LOCATIONS = [
  "China",
  "Hong Kong",
  "Singapore",
  "Tokyo",
  "US-West",
] as const;

/**
 * Type representing valid cluster locations
 */
export type ClusterLocation = (typeof CLUSTER_LOCATIONS)[number];

/**
 * Default cluster location for new clusters
 */
export const DEFAULT_CLUSTER_LOCATION: ClusterLocation = "Hong Kong";

/**
 * Alternative export name for backward compatibility
 * @deprecated Use CLUSTER_LOCATIONS instead
 */
export const AVAILABLE_CLUSTER_REGIONS = CLUSTER_LOCATIONS;

/**
 * Cluster status values
 */
export const CLUSTER_STATUSES = [
  "PENDING",
  "CREATING",
  "INITING",
  "RUNNING",
  "STOPPED",
  "DELETED",
] as const;

/**
 * Type representing valid cluster statuses
 */
export type ClusterStatus = (typeof CLUSTER_STATUSES)[number];

/**
 * Default cluster configuration
 */
export const DEFAULT_CLUSTER_CONFIG = {
  name: "Default Cluster",
  location: DEFAULT_CLUSTER_LOCATION,
  status: "PENDING" as const,
} as const;

/**
 * Cluster resource defaults
 */
export const CLUSTER_DEFAULTS = {
  /** Default node count for new clusters */
  nodeCount: 1,
  /** Default node type/machine type */
  nodeType: "standard",
  /** Default storage size in GB */
  storageSize: 20,
  /** Default Kubernetes version */
  k8sVersion: "1.28",
} as const;

/**
 * Cluster limits per subscription tier
 * These are maximum limits enforced at the application level
 */
export const CLUSTER_TIER_LIMITS = {
  FREE: 1,
  PRO: 3,
  BUSINESS: 10,
} as const;

/**
 * Type for subscription tiers
 */
export type SubscriptionTier = keyof typeof CLUSTER_TIER_LIMITS;

/**
 * Check if a location is valid
 */
export function isValidClusterLocation(
  location: string,
): location is ClusterLocation {
  return CLUSTER_LOCATIONS.includes(location as ClusterLocation);
}

/**
 * Get the display name for a cluster location
 * Can be used for localization in the future
 */
export function getClusterLocationDisplayName(
  location: ClusterLocation,
): string {
  const displayNames: Record<ClusterLocation, string> = {
    China: "China (Mainland)",
    "Hong Kong": "Hong Kong",
    Singapore: "Singapore",
    Tokyo: "Tokyo, Japan",
    "US-West": "US West",
  };
  return displayNames[location] ?? location;
}

/**
 * Validate cluster name
 * Rules:
 * - Must be between 1 and 100 characters
 * - Cannot be empty or whitespace only
 */
export function isValidClusterName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 100) return false;
  return true;
}

/**
 * Sanitize cluster name
 * Removes leading/trailing whitespace
 */
export function sanitizeClusterName(name: string): string {
  return name.trim();
}

export function generateClusterName(baseName = "Cluster"): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${baseName} ${timestamp}`;
}

export const K8S_DEFAULTS = {
  network: "Default",
  plan: "FREE" as const,
} as const;

/**
 * Detailed information and metadata for each cluster status
 */
export const CLUSTER_STATUS_DETAILS: Record<
  ClusterStatus,
  {
    label: string;
    description: string;
    variant: "secondary" | "default" | "destructive";
    bgColor: string;
    textColor: string;
    dotColor: string;
    animate?: boolean;
  }
> = {
  PENDING: {
    label: "Pending",
    description: "Cluster creation is queued and waiting to start",
    variant: "secondary",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    dotColor: "bg-slate-400",
  },
  CREATING: {
    label: "Creating",
    description: "Cluster infrastructure is being provisioned",
    variant: "secondary",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    animate: true,
  },
  INITING: {
    label: "Initializing",
    description: "Cluster is being configured and services are starting",
    variant: "secondary",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    dotColor: "bg-indigo-500",
    animate: true,
  },
  RUNNING: {
    label: "Running",
    description: "Cluster is operational and ready for workloads",
    variant: "default",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  STOPPED: {
    label: "Stopped",
    description: "Cluster is paused and not consuming resources",
    variant: "secondary",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  DELETED: {
    label: "Deleted",
    description: "Cluster has been marked for deletion",
    variant: "destructive",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};
