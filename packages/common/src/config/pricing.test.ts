import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CLUSTER_LIMITS,
  formatPrice,
  getLegacyPriceDisplayString,
  getPriceDisplayString,
  getStripePriceIds,
  getTrialPeriodDisplayString,
  LEGACY_PRICING_TIERS,
  PLAN_IDS,
  PRICING_TIERS,
  RESOURCE_LIMITS,
  STRIPE_PRICE_IDS,
  SUBSCRIPTION_CONFIG,
  type BillingCycle,
  type PlanTier,
} from "./pricing";

describe("Pricing Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("PRICING_TIERS", () => {
    it("should have STARTER tier with free pricing", () => {
      expect(PRICING_TIERS.STARTER.monthly).toBe(0);
      expect(PRICING_TIERS.STARTER.yearly).toBe(0);
    });

    it("should have PRO tier with correct pricing", () => {
      expect(PRICING_TIERS.PRO.monthly).toBe(15);
      expect(PRICING_TIERS.PRO.yearly).toBe(144);
    });

    it("should have BUSINESS tier with correct pricing", () => {
      expect(PRICING_TIERS.BUSINESS.monthly).toBe(30);
      expect(PRICING_TIERS.BUSINESS.yearly).toBe(300);
    });

    it("should offer yearly discount for PRO tier", () => {
      const yearlyEquivalent = PRICING_TIERS.PRO.monthly * 12;
      expect(PRICING_TIERS.PRO.yearly).toBeLessThan(yearlyEquivalent);
    });

    it("should offer yearly discount for BUSINESS tier", () => {
      const yearlyEquivalent = PRICING_TIERS.BUSINESS.monthly * 12;
      expect(PRICING_TIERS.BUSINESS.yearly).toBeLessThan(yearlyEquivalent);
    });
  });

  describe("LEGACY_PRICING_TIERS", () => {
    it("should have STARTER tier with free pricing", () => {
      expect(LEGACY_PRICING_TIERS.STARTER.monthly).toBe(0);
      expect(LEGACY_PRICING_TIERS.STARTER.yearly).toBe(0);
    });

    it("should have PRO tier with legacy pricing", () => {
      expect(LEGACY_PRICING_TIERS.PRO.monthly).toBe(30);
      expect(LEGACY_PRICING_TIERS.PRO.yearly).toBe(288);
    });

    it("should have BUSINESS tier with legacy pricing", () => {
      expect(LEGACY_PRICING_TIERS.BUSINESS.monthly).toBe(60);
      expect(LEGACY_PRICING_TIERS.BUSINESS.yearly).toBe(600);
    });

    it("should have different values than current PRICING_TIERS for non-free tiers", () => {
      expect(LEGACY_PRICING_TIERS.PRO.monthly).not.toBe(
        PRICING_TIERS.PRO.monthly,
      );
      expect(LEGACY_PRICING_TIERS.BUSINESS.monthly).not.toBe(
        PRICING_TIERS.BUSINESS.monthly,
      );
    });
  });

  describe("CLUSTER_LIMITS", () => {
    it("should have correct cluster limits per tier", () => {
      expect(CLUSTER_LIMITS.STARTER).toBe(1);
      expect(CLUSTER_LIMITS.PRO).toBe(3);
      expect(CLUSTER_LIMITS.BUSINESS).toBe(10);
    });

    it("should increase limits with higher tiers", () => {
      expect(CLUSTER_LIMITS.PRO).toBeGreaterThan(CLUSTER_LIMITS.STARTER);
      expect(CLUSTER_LIMITS.BUSINESS).toBeGreaterThan(CLUSTER_LIMITS.PRO);
    });
  });

  describe("RESOURCE_LIMITS", () => {
    it("should have correct post limits per tier", () => {
      expect(RESOURCE_LIMITS.STARTER.posts).toBe(100);
      expect(RESOURCE_LIMITS.PRO.posts).toBe(500);
      expect(RESOURCE_LIMITS.BUSINESS.posts).toBe(Infinity);
    });

    it("should have correct cluster limits per tier", () => {
      expect(RESOURCE_LIMITS.STARTER.clusters).toBe(1);
      expect(RESOURCE_LIMITS.PRO.clusters).toBe(3);
      expect(RESOURCE_LIMITS.BUSINESS.clusters).toBe(10);
    });

    it("should have BUSINESS tier with Infinity posts", () => {
      expect(RESOURCE_LIMITS.BUSINESS.posts).toBe(Infinity);
    });
  });

  describe("PLAN_IDS", () => {
    it("should have correct plan ID values", () => {
      expect(PLAN_IDS.STARTER).toBe("starter");
      expect(PLAN_IDS.PRO).toBe("pro");
      expect(PLAN_IDS.BUSINESS).toBe("business");
    });
  });

  describe("STRIPE_PRICE_IDS", () => {
    it("should have PRO price ID environment variable names", () => {
      expect(STRIPE_PRICE_IDS.PRO.monthly).toBe(
        "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID",
      );
      expect(STRIPE_PRICE_IDS.PRO.yearly).toBe(
        "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID",
      );
    });

    it("should have BUSINESS price ID environment variable names", () => {
      expect(STRIPE_PRICE_IDS.BUSINESS.monthly).toBe(
        "NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID",
      );
      expect(STRIPE_PRICE_IDS.BUSINESS.yearly).toBe(
        "NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID",
      );
    });

    it("should not have STARTER price IDs (free tier)", () => {
      expect(STRIPE_PRICE_IDS).not.toHaveProperty("STARTER");
    });
  });

  describe("getStripePriceIds", () => {
    it("should return null for missing environment variables", () => {
      delete process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      delete process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;
      delete process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID;
      delete process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID;

      const ids = getStripePriceIds();
      expect(ids.pro.monthly).toBeNull();
      expect(ids.pro.yearly).toBeNull();
      expect(ids.business.monthly).toBeNull();
      expect(ids.business.yearly).toBeNull();
    });

    it("should return environment variable values when set", () => {
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID = "price_pro_yearly";
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID =
        "price_business_monthly";
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID =
        "price_business_yearly";

      const ids = getStripePriceIds();
      expect(ids.pro.monthly).toBe("price_pro_monthly");
      expect(ids.pro.yearly).toBe("price_pro_yearly");
      expect(ids.business.monthly).toBe("price_business_monthly");
      expect(ids.business.yearly).toBe("price_business_yearly");
    });

    it("should return partial values when some env vars are set", () => {
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
      delete process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

      const ids = getStripePriceIds();
      expect(ids.pro.monthly).toBe("price_pro_monthly");
      expect(ids.pro.yearly).toBeNull();
    });
  });

  describe("formatPrice", () => {
    it("should return 'Free' for zero amount", () => {
      expect(formatPrice(0)).toBe("Free");
    });

    it("should format USD currency correctly", () => {
      expect(formatPrice(15)).toBe("$15");
      expect(formatPrice(30)).toBe("$30");
      expect(formatPrice(144)).toBe("$144");
    });

    it("should format with no decimal places", () => {
      expect(formatPrice(15.99)).toBe("$16");
      expect(formatPrice(30.5)).toBe("$31");
    });

    it("should support different currencies", () => {
      expect(formatPrice(100, "EUR")).toBe("€100");
      expect(formatPrice(100, "GBP")).toBe("£100");
      expect(formatPrice(100, "JPY")).toBe("¥100");
    });
  });

  describe("getPriceDisplayString", () => {
    it("should return 'Free' for STARTER tier", () => {
      expect(getPriceDisplayString("STARTER", "monthly")).toBe("Free");
      expect(getPriceDisplayString("STARTER", "yearly")).toBe("Free");
    });

    it("should return formatted price for PRO tier", () => {
      expect(getPriceDisplayString("PRO", "monthly")).toBe("$15");
      expect(getPriceDisplayString("PRO", "yearly")).toBe("$144");
    });

    it("should return formatted price for BUSINESS tier", () => {
      expect(getPriceDisplayString("BUSINESS", "monthly")).toBe("$30");
      expect(getPriceDisplayString("BUSINESS", "yearly")).toBe("$300");
    });
  });

  describe("getLegacyPriceDisplayString", () => {
    it("should return 'Free' for STARTER tier", () => {
      expect(getLegacyPriceDisplayString("STARTER", "monthly")).toBe("Free");
      expect(getLegacyPriceDisplayString("STARTER", "yearly")).toBe("Free");
    });

    it("should return legacy formatted price for PRO tier", () => {
      expect(getLegacyPriceDisplayString("PRO", "monthly")).toBe("$30");
      expect(getLegacyPriceDisplayString("PRO", "yearly")).toBe("$288");
    });

    it("should return legacy formatted price for BUSINESS tier", () => {
      expect(getLegacyPriceDisplayString("BUSINESS", "monthly")).toBe("$60");
      expect(getLegacyPriceDisplayString("BUSINESS", "yearly")).toBe("$600");
    });
  });

  describe("SUBSCRIPTION_CONFIG", () => {
    it("should have correct trial period days", () => {
      expect(SUBSCRIPTION_CONFIG.trialPeriodDays).toBe(14);
    });

    it("should have PRO as trial eligible plan", () => {
      expect(SUBSCRIPTION_CONFIG.trialEligiblePlans).toContain("PRO");
    });

    it("should have correct grace period days", () => {
      expect(SUBSCRIPTION_CONFIG.gracePeriodDays).toBe(3);
    });
  });

  describe("getTrialPeriodDisplayString", () => {
    it("should return English format by default", () => {
      expect(getTrialPeriodDisplayString()).toBe("14-day");
    });

    it("should return correct format for each locale", () => {
      expect(getTrialPeriodDisplayString("en")).toBe("14-day");
      expect(getTrialPeriodDisplayString("zh")).toBe("14天");
      expect(getTrialPeriodDisplayString("ja")).toBe("14日間");
      expect(getTrialPeriodDisplayString("ko")).toBe("14일");
    });

    it("should support custom days parameter", () => {
      expect(getTrialPeriodDisplayString("en", 7)).toBe("7-day");
      expect(getTrialPeriodDisplayString("zh", 30)).toBe("30天");
    });
  });

  describe("Type exports", () => {
    it("should export PlanTier type", () => {
      const tier: PlanTier = "PRO";
      expect(tier).toBe("PRO");
    });

    it("should export BillingCycle type", () => {
      const cycle: BillingCycle = "monthly";
      expect(cycle).toBe("monthly");
    });
  });
});
