import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FEATURE_FLAGS,
  getEnabledFeatures,
  isFeatureEnabled,
} from "./features";

describe("Feature Flags", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("FEATURE_FLAGS", () => {
    it("should have billing enabled by default", () => {
      expect(FEATURE_FLAGS.billing.enabled).toBe(true);
    });

    it("should have clusters enabled by default", () => {
      expect(FEATURE_FLAGS.clusters.enabled).toBe(true);
    });

    it("should have auto provisioning disabled by default", () => {
      expect(FEATURE_FLAGS.clusters.autoProvisioning).toBe(false);
    });

    it("should have multi region disabled by default", () => {
      expect(FEATURE_FLAGS.clusters.multiRegion).toBe(false);
    });

    it("should have magic links disabled by default", () => {
      expect(FEATURE_FLAGS.auth.magicLinks).toBe(false);
    });

    it("should have oauth providers disabled by default", () => {
      expect(FEATURE_FLAGS.auth.oauth.google).toBe(false);
      expect(FEATURE_FLAGS.auth.oauth.github).toBe(false);
    });

    it("should have email notifications enabled by default", () => {
      expect(FEATURE_FLAGS.notifications.email).toBe(true);
    });

    it("should have webhooks disabled by default", () => {
      expect(FEATURE_FLAGS.notifications.webhooks).toBe(false);
    });

    it("should have admin dashboard enabled by default", () => {
      expect(FEATURE_FLAGS.admin.dashboard).toBe(true);
    });

    it("should have user management disabled by default", () => {
      expect(FEATURE_FLAGS.admin.userManagement).toBe(false);
    });

    it("should have debug mode disabled by default", () => {
      expect(FEATURE_FLAGS.dev.debugMode).toBe(false);
    });

    it("should have mock payments disabled by default", () => {
      expect(FEATURE_FLAGS.dev.mockPayments).toBe(false);
    });

    it("should have AI features disabled by default", () => {
      expect(FEATURE_FLAGS.ai.enabled).toBe(false);
      expect(FEATURE_FLAGS.ai.chatbot).toBe(false);
      expect(FEATURE_FLAGS.ai.contentGeneration).toBe(false);
      expect(FEATURE_FLAGS.ai.recommendations).toBe(false);
      expect(FEATURE_FLAGS.ai.analytics).toBe(false);
    });
  });

  describe("isFeatureEnabled", () => {
    it("should return true for enabled boolean feature paths", () => {
      expect(isFeatureEnabled("billing.enabled")).toBe(true);
      expect(isFeatureEnabled("billing.stripeCheckout")).toBe(true);
    });

    it("should return false for disabled features", () => {
      expect(isFeatureEnabled("clusters.autoProvisioning")).toBe(false);
      expect(isFeatureEnabled("auth.magicLinks")).toBe(false);
    });

    it("should return false for non-existent paths", () => {
      expect(isFeatureEnabled("nonexistent")).toBe(false);
      expect(isFeatureEnabled("billing.nonexistent")).toBe(false);
    });

    it("should return false for empty path", () => {
      expect(isFeatureEnabled("")).toBe(false);
    });

    it("should handle nested paths correctly", () => {
      expect(isFeatureEnabled("auth.oauth.google")).toBe(false);
      expect(isFeatureEnabled("auth.oauth.github")).toBe(false);
    });

    it("should return false for non-boolean values", () => {
      expect(isFeatureEnabled("auth.oauth")).toBe(false);
    });
  });

  describe("getEnabledFeatures", () => {
    it("should return array of enabled feature paths", () => {
      const enabled = getEnabledFeatures();
      expect(Array.isArray(enabled)).toBe(true);
    });

    it("should include billing.enabled by default", () => {
      const enabled = getEnabledFeatures();
      expect(enabled).toContain("billing.enabled");
    });

    it("should include clusters.enabled by default", () => {
      const enabled = getEnabledFeatures();
      expect(enabled).toContain("clusters.enabled");
    });

    it("should not include disabled features", () => {
      const enabled = getEnabledFeatures();
      expect(enabled).not.toContain("clusters.autoProvisioning");
      expect(enabled).not.toContain("auth.magicLinks");
    });

    it("should return unique paths", () => {
      const enabled = getEnabledFeatures();
      const uniquePaths = [...new Set(enabled)];
      expect(enabled.length).toBe(uniquePaths.length);
    });
  });
});
