import { describe, expect, it } from "vitest";

import {
  AVAILABLE_CLUSTER_REGIONS,
  CLUSTER_DEFAULTS,
  CLUSTER_LOCATIONS,
  CLUSTER_STATUSES,
  CLUSTER_TIER_LIMITS,
  DEFAULT_CLUSTER_CONFIG,
  DEFAULT_CLUSTER_LOCATION,
  generateClusterName,
  getClusterLocationDisplayName,
  isValidClusterLocation,
  isValidClusterName,
  K8S_DEFAULTS,
  sanitizeClusterName,
  type ClusterLocation,
  type ClusterStatus,
  type SubscriptionTier,
} from "./k8s";

describe("Kubernetes Configuration", () => {
  describe("CLUSTER_LOCATIONS", () => {
    it("should have correct locations", () => {
      expect(CLUSTER_LOCATIONS).toContain("China");
      expect(CLUSTER_LOCATIONS).toContain("Hong Kong");
      expect(CLUSTER_LOCATIONS).toContain("Singapore");
      expect(CLUSTER_LOCATIONS).toContain("Tokyo");
      expect(CLUSTER_LOCATIONS).toContain("US-West");
    });

    it("should have 5 locations", () => {
      expect(CLUSTER_LOCATIONS.length).toBe(5);
    });

    it("should be readonly array", () => {
      expect(Array.isArray(CLUSTER_LOCATIONS)).toBe(true);
    });
  });

  describe("DEFAULT_CLUSTER_LOCATION", () => {
    it("should be Hong Kong", () => {
      expect(DEFAULT_CLUSTER_LOCATION).toBe("Hong Kong");
    });

    it("should be a valid cluster location", () => {
      expect(CLUSTER_LOCATIONS).toContain(DEFAULT_CLUSTER_LOCATION);
    });
  });

  describe("AVAILABLE_CLUSTER_REGIONS", () => {
    it("should be alias for CLUSTER_LOCATIONS", () => {
      expect(AVAILABLE_CLUSTER_REGIONS).toEqual(CLUSTER_LOCATIONS);
    });
  });

  describe("CLUSTER_STATUSES", () => {
    it("should have correct statuses", () => {
      expect(CLUSTER_STATUSES).toContain("PENDING");
      expect(CLUSTER_STATUSES).toContain("CREATING");
      expect(CLUSTER_STATUSES).toContain("INITING");
      expect(CLUSTER_STATUSES).toContain("RUNNING");
      expect(CLUSTER_STATUSES).toContain("STOPPED");
      expect(CLUSTER_STATUSES).toContain("DELETED");
    });

    it("should have 6 statuses", () => {
      expect(CLUSTER_STATUSES.length).toBe(6);
    });
  });

  describe("DEFAULT_CLUSTER_CONFIG", () => {
    it("should have correct name", () => {
      expect(DEFAULT_CLUSTER_CONFIG.name).toBe("Default Cluster");
    });

    it("should have correct location", () => {
      expect(DEFAULT_CLUSTER_CONFIG.location).toBe(DEFAULT_CLUSTER_LOCATION);
    });

    it("should have PENDING status", () => {
      expect(DEFAULT_CLUSTER_CONFIG.status).toBe("PENDING");
    });
  });

  describe("CLUSTER_DEFAULTS", () => {
    it("should have correct node count", () => {
      expect(CLUSTER_DEFAULTS.nodeCount).toBe(1);
    });

    it("should have correct node type", () => {
      expect(CLUSTER_DEFAULTS.nodeType).toBe("standard");
    });

    it("should have correct storage size", () => {
      expect(CLUSTER_DEFAULTS.storageSize).toBe(20);
    });

    it("should have correct Kubernetes version", () => {
      expect(CLUSTER_DEFAULTS.k8sVersion).toBe("1.28");
    });
  });

  describe("CLUSTER_TIER_LIMITS", () => {
    it("should have correct FREE tier limit", () => {
      expect(CLUSTER_TIER_LIMITS.FREE).toBe(1);
    });

    it("should have correct PRO tier limit", () => {
      expect(CLUSTER_TIER_LIMITS.PRO).toBe(3);
    });

    it("should have correct BUSINESS tier limit", () => {
      expect(CLUSTER_TIER_LIMITS.BUSINESS).toBe(10);
    });

    it("should increase limits with higher tiers", () => {
      expect(CLUSTER_TIER_LIMITS.PRO).toBeGreaterThan(CLUSTER_TIER_LIMITS.FREE);
      expect(CLUSTER_TIER_LIMITS.BUSINESS).toBeGreaterThan(
        CLUSTER_TIER_LIMITS.PRO,
      );
    });
  });

  describe("K8S_DEFAULTS", () => {
    it("should have correct network default", () => {
      expect(K8S_DEFAULTS.network).toBe("Default");
    });

    it("should have correct plan default", () => {
      expect(K8S_DEFAULTS.plan).toBe("FREE");
    });
  });

  describe("isValidClusterLocation", () => {
    it("should return true for valid locations", () => {
      expect(isValidClusterLocation("China")).toBe(true);
      expect(isValidClusterLocation("Hong Kong")).toBe(true);
      expect(isValidClusterLocation("Singapore")).toBe(true);
      expect(isValidClusterLocation("Tokyo")).toBe(true);
      expect(isValidClusterLocation("US-West")).toBe(true);
    });

    it("should return false for invalid locations", () => {
      expect(isValidClusterLocation("Europe")).toBe(false);
      expect(isValidClusterLocation("US-East")).toBe(false);
      expect(isValidClusterLocation("")).toBe(false);
      expect(isValidClusterLocation("hong kong")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isValidClusterLocation("china")).toBe(false);
      expect(isValidClusterLocation("HONG KONG")).toBe(false);
    });
  });

  describe("getClusterLocationDisplayName", () => {
    it("should return correct display name for China", () => {
      expect(getClusterLocationDisplayName("China")).toBe("China (Mainland)");
    });

    it("should return correct display name for Hong Kong", () => {
      expect(getClusterLocationDisplayName("Hong Kong")).toBe("Hong Kong");
    });

    it("should return correct display name for Singapore", () => {
      expect(getClusterLocationDisplayName("Singapore")).toBe("Singapore");
    });

    it("should return correct display name for Tokyo", () => {
      expect(getClusterLocationDisplayName("Tokyo")).toBe("Tokyo, Japan");
    });

    it("should return correct display name for US-West", () => {
      expect(getClusterLocationDisplayName("US-West")).toBe("US West");
    });
  });

  describe("isValidClusterName", () => {
    it("should return true for valid names", () => {
      expect(isValidClusterName("My Cluster")).toBe(true);
      expect(isValidClusterName("Production")).toBe(true);
      expect(isValidClusterName("Test-123")).toBe(true);
      expect(isValidClusterName("a")).toBe(true);
    });

    it("should return false for empty names", () => {
      expect(isValidClusterName("")).toBe(false);
    });

    it("should return false for whitespace-only names", () => {
      expect(isValidClusterName("   ")).toBe(false);
      expect(isValidClusterName("\t")).toBe(false);
      expect(isValidClusterName("\n")).toBe(false);
    });

    it("should return false for names exceeding 100 characters", () => {
      const longName = "a".repeat(101);
      expect(isValidClusterName(longName)).toBe(false);
    });

    it("should return true for names exactly 100 characters", () => {
      const maxName = "a".repeat(100);
      expect(isValidClusterName(maxName)).toBe(true);
    });

    it("should handle names with leading/trailing whitespace", () => {
      expect(isValidClusterName("  valid  ")).toBe(true);
    });
  });

  describe("sanitizeClusterName", () => {
    it("should trim leading whitespace", () => {
      expect(sanitizeClusterName("  My Cluster")).toBe("My Cluster");
    });

    it("should trim trailing whitespace", () => {
      expect(sanitizeClusterName("My Cluster  ")).toBe("My Cluster");
    });

    it("should trim both leading and trailing whitespace", () => {
      expect(sanitizeClusterName("  My Cluster  ")).toBe("My Cluster");
    });

    it("should not modify internal whitespace", () => {
      expect(sanitizeClusterName("My  Cluster")).toBe("My  Cluster");
    });

    it("should return empty string for whitespace-only input", () => {
      expect(sanitizeClusterName("   ")).toBe("");
    });
  });

  describe("generateClusterName", () => {
    it("should generate name with default base", () => {
      const name = generateClusterName();
      expect(name).toMatch(/^Cluster \d{4}-\d{2}-\d{2}$/);
    });

    it("should generate name with custom base", () => {
      const name = generateClusterName("Production");
      expect(name).toMatch(/^Production \d{4}-\d{2}-\d{2}$/);
    });

    it("should include current date", () => {
      const name = generateClusterName();
      const today = new Date().toISOString().split("T")[0];
      expect(name).toContain(today);
    });
  });

  describe("Type exports", () => {
    it("should export ClusterLocation type", () => {
      const location: ClusterLocation = "Singapore";
      expect(location).toBe("Singapore");
    });

    it("should export ClusterStatus type", () => {
      const status: ClusterStatus = "RUNNING";
      expect(status).toBe("RUNNING");
    });

    it("should export SubscriptionTier type", () => {
      const tier: SubscriptionTier = "PRO";
      expect(tier).toBe("PRO");
    });
  });
});
