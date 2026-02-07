/**
 * Centralized Kubernetes Configuration
 * 
 * This module provides a single source of truth for all Kubernetes-related
 * configuration values, eliminating hardcoded cluster settings.
 * All values can be configured via environment variables.
 * 
 * @module @saasfly/common/config/k8s
 */

import { env } from "../env.mjs";

/**
 * Parse string environment variable with fallback
 */
function parseEnvString(value: string | undefined, fallback: string): string {
  return value ?? fallback;
}

/**
 * Parse numeric environment variable with fallback
 */
function parseEnvNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Parse array environment variable with fallback
 */
function parseEnvArray(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value.split(",").map(s => s.trim()).filter(Boolean);
}

/**
 * Available cluster locations/regions
 * 
 * These are the geographic locations where Kubernetes clusters can be deployed.
 * Using a readonly array ensures these cannot be modified at runtime.
 * Configurable via NEXT_PUBLIC_CLUSTER_LOCATIONS environment variable.
 */
export const CLUSTER_LOCATIONS = parseEnvArray(
  env.NEXT_PUBLIC_CLUSTER_LOCATIONS,
  ["China", "Hong Kong", "Singapore", "Tokyo", "US-West"]
) as readonly string[];

/**
 * Type representing valid cluster locations
 */
export type ClusterLocation = string;

/**
 * Default cluster location for new clusters
 * Configurable via NEXT_PUBLIC_DEFAULT_CLUSTER_LOCATION environment variable
 */
export const DEFAULT_CLUSTER_LOCATION: ClusterLocation = parseEnvString(
  env.NEXT_PUBLIC_DEFAULT_CLUSTER_LOCATION,
  "Hong Kong"
);

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
 * All values are configurable via environment variables
 */
export const CLUSTER_DEFAULTS = {
  /** Default node count for new clusters */
  nodeCount: parseEnvNumber(env.NEXT_PUBLIC_DEFAULT_NODE_COUNT, 1),
  /** Default node type/machine type */
  nodeType: parseEnvString(env.NEXT_PUBLIC_DEFAULT_NODE_TYPE, "standard"),
  /** Default storage size in GB */
  storageSize: parseEnvNumber(env.NEXT_PUBLIC_DEFAULT_STORAGE_SIZE, 20),
  /** Default Kubernetes version */
  k8sVersion: parseEnvString(env.NEXT_PUBLIC_DEFAULT_K8S_VERSION, "1.28"),
} as const;

/**
 * Cluster limits per subscription tier
 * These are maximum limits enforced at the application level
 * All values are configurable via environment variables
 */
export const CLUSTER_TIER_LIMITS = {
  FREE: parseEnvNumber(env.NEXT_PUBLIC_CLUSTER_LIMIT_FREE, 1),
  PRO: parseEnvNumber(env.NEXT_PUBLIC_CLUSTER_LIMIT_PRO, 3),
  BUSINESS: parseEnvNumber(env.NEXT_PUBLIC_CLUSTER_LIMIT_BUSINESS, 10),
} as const;

/**
 * Type for subscription tiers
 */
export type SubscriptionTier = keyof typeof CLUSTER_TIER_LIMITS;

/**
 * Check if a location is valid
 */
export function isValidClusterLocation(location: string): location is ClusterLocation {
  return CLUSTER_LOCATIONS.includes(location as ClusterLocation);
}

/**
 * Get the display name for a cluster location
 * Can be used for localization in the future
 */
export function getClusterLocationDisplayName(location: ClusterLocation): string {
  const displayNames: Record<ClusterLocation, string> = {
    "China": "China (Mainland)",
    "Hong Kong": "Hong Kong",
    "Singapore": "Singapore",
    "Tokyo": "Tokyo, Japan",
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

/**
 * Generate a unique cluster name with timestamp
 * Useful for creating default cluster names
 */
export function generateClusterName(baseName: string = "Cluster"): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${baseName} ${timestamp}`;
}
