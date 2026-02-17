import { SubscriptionPlan } from "@saasfly/db";

import { env } from "./env.mjs";

export const getPlans = () => {
  const plans: Record<
    string,
    (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan]
  > = {};

  if (env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID) {
    plans[env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID] = SubscriptionPlan.PRO;
  }
  if (env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID) {
    plans[env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID] = SubscriptionPlan.PRO;
  }
  if (env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID) {
    plans[env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID] =
      SubscriptionPlan.BUSINESS;
  }
  if (env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID) {
    plans[env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID] =
      SubscriptionPlan.BUSINESS;
  }

  return plans;
};

export const PLANS = getPlans();

type PlanType = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export function getSubscriptionPlan(priceId: string | undefined): PlanType {
  return priceId && PLANS[priceId] ? PLANS[priceId]! : SubscriptionPlan.FREE;
}
