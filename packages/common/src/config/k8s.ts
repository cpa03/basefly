/**
 * Centralized Kubernetes Configuration
 * 
 * This module provides a single source of truth for all Kubernetes-related
 * configuration values, eliminating hardcoded cluster settings.
 * 
 * All configuration is now read from environment variables with sensible defaults.
 * 
 * Flexy Principle: No hardcoded K8s settings - everything is configurable!
 * 
 * @module @saasfly/common/config/k8s
 */

import { K8S_CONFIG, type ClusterLocation, type ClusterStatus } from "./app";

/**
 * Available cluster locations/regions
 * 
 * These are the geographic locations where Kubernetes clusters can be deployed.
 * Using a readonly array ensures these cannot be modified at runtime.
 * 
 * Configurable via: CLUSTER_LOCATIONS (comma-separated)
 */
export const CLUSTER_LOCATIONS = K8S_CONFIG.locations;

/**
 * Type representing valid cluster locations
 */
export type { ClusterLocation };

/**
 * Default cluster location for new clusters
 * 
 * Configurable via: DEFAULT_CLUSTER_LOCATION
 */
export const DEFAULT_CLUSTER_LOCATION = K8S_CONFIG.defaultLocation;

/**
 * Alternative export name for backward compatibility
 * @deprecated Use CLUSTER_LOCATIONS instead
 */
export const AVAILABLE_CLUSTER_REGIONS = CLUSTER_LOCATIONS;

/**
 * Cluster status values
 */
export const CLUSTER_STATUSES = K8S_CONFIG.statuses;

/**
 * Type representing valid cluster statuses
 */
export type { ClusterStatus };

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
 * 
 * All values are configurable via environment variables:
 * - K8S_DEFAULT_NODE_COUNT
 * - K8S_DEFAULT_NODE_TYPE
 * - K8S_DEFAULT_STORAGE_SIZE
 * - K8S_DEFAULT_VERSION
 */
export const CLUSTER_DEFAULTS = K8S_CONFIG.defaults;

/**
 * Cluster limits per subscription tier
 * These are maximum limits enforced at the application level
 * 
 * Configurable via:
 * - K8S_TIER_LIMIT_FREE
 * - K8S_TIER_LIMIT_PRO
 * - K8S_TIER_LIMIT_BUSINESS
 */
export const CLUSTER_TIER_LIMITS = K8S_CONFIG.tierLimits;

/**
 * Type for subscription tiers
 */
export type SubscriptionTier = keyof typeof CLUSTER_TIER_LIMITS;

/**
 * Check if a location is valid
 */
export function isValidClusterLocation(location: string): location is ClusterLocation {
  return (CLUSTER_LOCATIONS).includes(location);
}

/**
 * Get the display name for a cluster location
 * Can be used for localization in the future
 */
export function getClusterLocationDisplayName(location: ClusterLocation): string {
  const displayNames: Record<string, string> = {
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
 * - Must be between 1 and max length characters (default: 100)
 * - Cannot be empty or whitespace only
 * 
 * Max length is configurable via: K8S_MAX_NAME_LENGTH
 */
export function isValidClusterName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > CLUSTER_DEFAULTS.maxNameLength) return false;
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
export function generateClusterName(baseName = "Cluster"): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${baseName} ${timestamp}`;
}
