import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubscriptionPlan } from "./plans";

vi.mock("@saasfly/db", () => ({
  db: {},
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
}));

vi.mock("./env.mjs", () => ({
  env: {
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: "price_pro_monthly",
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: "price_pro_yearly",
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: "price_business_monthly",
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: "price_business_yearly",
  },
}));

describe("getSubscriptionPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns PRO plan for valid monthly Pro price ID", () => {
    const result = getSubscriptionPlan("price_pro_monthly");
    expect(result).toBe("PRO");
  });

  it("returns PRO plan for valid yearly Pro price ID", () => {
    const result = getSubscriptionPlan("price_pro_yearly");
    expect(result).toBe("PRO");
  });

  it("returns BUSINESS plan for valid monthly Business price ID", () => {
    const result = getSubscriptionPlan("price_business_monthly");
    expect(result).toBe("BUSINESS");
  });

  it("returns BUSINESS plan for valid yearly Business price ID", () => {
    const result = getSubscriptionPlan("price_business_yearly");
    expect(result).toBe("BUSINESS");
  });

  it("returns FREE plan for unknown price ID", () => {
    const result = getSubscriptionPlan("price_unknown");
    expect(result).toBe("FREE");
  });

  it("returns FREE plan for undefined price ID", () => {
    const result = getSubscriptionPlan(undefined);
    expect(result).toBe("FREE");
  });

  it("returns FREE plan for empty string price ID", () => {
    const result = getSubscriptionPlan("");
    expect(result).toBe("FREE");
  });
});
