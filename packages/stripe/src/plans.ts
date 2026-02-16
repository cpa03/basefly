import { SubscriptionPlan } from "@saasfly/db";

const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined") {
    return process.env[key];
  }
  return undefined;
};

export const PLANS: Record<
  string,
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan]
> = {
  ...(getEnvVar("NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID") && {
    [getEnvVar("NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID")!]:
      SubscriptionPlan.PRO,
  }),
  ...(getEnvVar("NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID") && {
    [getEnvVar("NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID")!]:
      SubscriptionPlan.PRO,
  }),
  ...(getEnvVar("NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID") && {
    [getEnvVar("NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID")!]:
      SubscriptionPlan.BUSINESS,
  }),
  ...(getEnvVar("NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID") && {
    [getEnvVar("NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID")!]:
      SubscriptionPlan.BUSINESS,
  }),
};

type PlanType = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export function getSubscriptionPlan(priceId: string | undefined): PlanType {
  return priceId && PLANS[priceId] ? PLANS[priceId]! : SubscriptionPlan.FREE;
}
