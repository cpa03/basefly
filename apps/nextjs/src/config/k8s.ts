export const CLUSTER_LOCATIONS = [
  "China",
  "Hong Kong",
  "Singapore",
  "Tokyo",
  "US-West",
] as const;

export type ClusterLocation = (typeof CLUSTER_LOCATIONS)[number];

export const DEFAULT_CLUSTER_LOCATION: ClusterLocation = "Hong Kong";

export const AVAILABLE_CLUSTER_REGIONS = CLUSTER_LOCATIONS;
