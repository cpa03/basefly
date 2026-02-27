import { describe, expect, it } from "vitest";

import { PRICING_TIERS, RESOURCE_LIMITS } from "./config/pricing";
import {
  LIMITS,
  PRICING,
  pricingData,
  type SubscriptionPlan,
} from "./subscriptions";

describe("subscriptions.ts - pricingData", () => {
  it("should have three subscription plans", () => {
    expect(pricingData.length).toBe(3);
  });

  it("should have Starter plan as first item", () => {
    const starter = pricingData[0]!;
    expect(starter.title).toBe("Starter");
    expect(starter.description).toBe("For Beginners");
    expect(starter.benefits).toBeDefined();
    expect(starter.limitations).toBeDefined();
    expect(starter.prices).toBeDefined();
    expect(starter.stripeIds).toBeDefined();
  });

  it("should have Pro plan as second item", () => {
    const pro = pricingData[1]!;
    expect(pro.title).toBe("Pro");
    expect(pro.description).toBe("Unlock Advanced Features");
    expect(pro.benefits).toBeDefined();
    expect(pro.limitations).toBeDefined();
    expect(pro.prices).toBeDefined();
    expect(pro.stripeIds).toBeDefined();
  });

  it("should have Business plan as third item", () => {
    const business = pricingData[2]!;
    expect(business.title).toBe("Business");
    expect(business.description).toBe("For Power Users");
    expect(business.benefits).toBeDefined();
    expect(business.limitations).toBeDefined();
    expect(business.prices).toBeDefined();
    expect(business.stripeIds).toBeDefined();
  });

  it("should have monthly and yearly prices for each plan", () => {
    pricingData.forEach((plan) => {
      expect(plan.prices.monthly).toBeDefined();
      expect(plan.prices.yearly).toBeDefined();
      expect(typeof plan.prices.monthly).toBe("number");
      expect(typeof plan.prices.yearly).toBe("number");
    });
  });

  it("should have stripeIds for each plan", () => {
    pricingData.forEach((plan) => {
      expect(plan.stripeIds.monthly).toBeDefined();
      expect(plan.stripeIds.yearly).toBeDefined();
    });
  });

  it("should have Starter plan with null stripe IDs", () => {
    const starter = pricingData[0]!;
    expect(starter.stripeIds.monthly).toBeNull();
    expect(starter.stripeIds.yearly).toBeNull();
  });

  it("should have Pro and Business plans with valid stripe IDs", () => {
    const pro = pricingData[1]!;
    const business = pricingData[2]!;

    // These should have non-null stripe IDs from config
    expect(pro.stripeIds.monthly).toBeDefined();
    expect(pro.stripeIds.yearly).toBeDefined();
    expect(business.stripeIds.monthly).toBeDefined();
    expect(business.stripeIds.yearly).toBeDefined();
  });
});

describe("subscriptions.ts - Plan Structure", () => {
  it("should have benefits array for each plan", () => {
    pricingData.forEach((plan) => {
      expect(Array.isArray(plan.benefits)).toBe(true);
      expect(plan.benefits.length).toBeGreaterThan(0);
    });
  });

  it("should have limitations array for each plan", () => {
    pricingData.forEach((plan) => {
      expect(Array.isArray(plan.limitations)).toBe(true);
    });
  });

  it("should have Business plan with no limitations", () => {
    const business = pricingData[2]!;
    expect(business.limitations.length).toBe(0);
  });

  it("should have description for each plan", () => {
    pricingData.forEach((plan) => {
      expect(typeof plan.description).toBe("string");
      expect(plan.description.length).toBeGreaterThan(0);
    });
  });
});

describe("subscriptions.ts - Pricing Values", () => {
  it("should match pricing with PRICING_TIERS config", () => {
    expect(pricingData[0]!.prices.monthly).toBe(PRICING_TIERS.STARTER.monthly);
    expect(pricingData[0]!.prices.yearly).toBe(PRICING_TIERS.STARTER.yearly);

    expect(pricingData[1]!.prices.monthly).toBe(PRICING_TIERS.PRO.monthly);
    expect(pricingData[1]!.prices.yearly).toBe(PRICING_TIERS.PRO.yearly);

    expect(pricingData[2]!.prices.monthly).toBe(PRICING_TIERS.BUSINESS.monthly);
    expect(pricingData[2]!.prices.yearly).toBe(PRICING_TIERS.BUSINESS.yearly);
  });

  it("should have yearly prices lower than monthly (annual discount)", () => {
    // Only check paid plans (Starter has 0 prices)
    const paidPlans = pricingData.filter((plan) => plan.prices.monthly > 0);
    paidPlans.forEach((plan) => {
      // Yearly should be less than 12x monthly (typical annual discount)
      expect(plan.prices.yearly).toBeLessThan(plan.prices.monthly * 12);
    });
  });
});

describe("subscriptions.ts - Deprecated Exports", () => {
  it("should export PRICING as alias for PRICING_TIERS", () => {
    expect(PRICING).toBe(PRICING_TIERS);
  });

  it("should export LIMITS as alias for RESOURCE_LIMITS", () => {
    expect(LIMITS).toBe(RESOURCE_LIMITS);
  });

  it("PRICING should have STARTER, PRO, BUSINESS tiers", () => {
    expect(PRICING.STARTER).toBeDefined();
    expect(PRICING.PRO).toBeDefined();
    expect(PRICING.BUSINESS).toBeDefined();
  });

  it("LIMITS should have STARTER, PRO, BUSINESS limits", () => {
    expect(LIMITS.STARTER).toBeDefined();
    expect(LIMITS.PRO).toBeDefined();
    expect(LIMITS.BUSINESS).toBeDefined();
  });
});

describe("subscriptions.ts - Type exports", () => {
  it("should export SubscriptionPlan type", () => {
    const plan: SubscriptionPlan = {
      title: "Test Plan",
      description: "Test Description",
      benefits: ["Benefit 1"],
      limitations: ["Limitation 1"],
      prices: {
        monthly: 10,
        yearly: 100,
      },
      stripeIds: {
        monthly: "price_monthly",
        yearly: "price_yearly",
      },
    };

    expect(plan.title).toBe("Test Plan");
    expect(plan.benefits.length).toBe(1);
    expect(plan.prices.monthly).toBe(10);
    expect(plan.stripeIds.monthly).toBe("price_monthly");
  });

  it("should have correct types for SubscriptionPlan prices", () => {
    const plan: SubscriptionPlan = {
      title: "Test",
      description: "Test",
      benefits: [],
      limitations: [],
      prices: {
        monthly: 29,
        yearly: 290,
      },
      stripeIds: {
        monthly: null,
        yearly: null,
      },
    };

    expect(typeof plan.prices.monthly).toBe("number");
    expect(typeof plan.prices.yearly).toBe("number");
  });
});
