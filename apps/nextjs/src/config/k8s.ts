/**
 * Kubernetes Configuration
 * 
 * This module re-exports cluster configuration from @saasfly/common
 * to maintain backward compatibility while using centralized config.
 * 
 * @deprecated Import directly from @saasfly/common instead
 */

export {
  CLUSTER_LOCATIONS,
  DEFAULT_CLUSTER_LOCATION,
  AVAILABLE_CLUSTER_REGIONS,
  CLUSTER_STATUSES,
  DEFAULT_CLUSTER_CONFIG,
  CLUSTER_DEFAULTS,
  CLUSTER_TIER_LIMITS,
  isValidClusterLocation,
  getClusterLocationDisplayName,
  isValidClusterName,
  sanitizeClusterName,
  generateClusterName,
} from "@saasfly/common";

export type {
  ClusterLocation,
  ClusterStatus,
  SubscriptionTier,
} from "@saasfly/common";
