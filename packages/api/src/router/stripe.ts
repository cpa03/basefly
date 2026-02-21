import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { PLAN_VALIDATION, pricingData } from "@saasfly/common";
import { Customer, db } from "@saasfly/db";
import {
  createBillingSession,
  createCheckoutSession,
  IntegrationError,
  retrieveSubscription,
} from "@saasfly/stripe";

import { env } from "../env.mjs";
import { handleIntegrationError } from "../errors";
import { logger } from "../logger";
import {
  createRateLimitedProtectedProcedure,
  createTRPCRouter,
  EndpointType,
} from "../trpc";

export interface SubscriptionPlan {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
}

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<
    Customer,
    "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"
  > & {
    stripeCurrentPeriodEnd?: number;
    isPaid: boolean;
    interval: "month" | "year" | null;
    isCanceled?: boolean;
  };
// Enhanced schema with comprehensive validation using centralized constants
export const createSessionSchema = z
  .object({
    planId: z
      .string()
      .min(PLAN_VALIDATION.id.minLength, "Plan ID cannot be empty")
      .regex(/^price_/, "Plan ID must start with 'price_'"),
  })
  .strict();

export const stripeRouter = createTRPCRouter({
  createSession: createRateLimitedProtectedProcedure("stripe")
    .input(createSessionSchema)
    .mutation(async (opts) => {
      const userId = opts.ctx.userId! as string;
      const planId = opts.input.planId;
      const requestId = opts.ctx.requestId;
      const customer = await db
        .selectFrom("Customer")
        .select(["id", "plan", "stripeCustomerId"])
        .where("authUserId", "=", userId)
        .executeTakeFirst();

      const returnUrl = env.NEXT_PUBLIC_APP_URL + "/dashboard";

      try {
        if (customer && customer.plan !== "FREE") {
          // Guard against missing stripeCustomerId - should not happen but provides safety
          if (!customer.stripeCustomerId) {
            // Fall through to create new checkout session instead of failing
            logger.warn(
              { userId, requestId, customerPlan: customer.plan },
              "Customer has non-FREE plan but no stripeCustomerId, creating new checkout session",
            );
          } else {
            const session = await createBillingSession(
              customer.stripeCustomerId,
              returnUrl,
              { requestId },
            );
            return { success: true as const, url: session.url };
          }
        }

        const user = await db
          .selectFrom("User")
          .select(["email"])
          .where("id", "=", userId)
          .executeTakeFirst();

        const email = user?.email ?? undefined;

        const session = await createCheckoutSession(
          {
            mode: "subscription",
            payment_method_types: ["card"],
            customer_email: email,
            client_reference_id: userId,
            subscription_data: { metadata: { userId } },
            cancel_url: returnUrl,
            success_url: returnUrl,
            line_items: [{ price: planId, quantity: 1 }],
          },
          `checkout_${userId}_${planId}`,
          { requestId },
        );

        if (!session.url) return { success: false as const };
        return { success: true as const, url: session.url };
      } catch (error) {
        if (error instanceof IntegrationError) {
          throw handleIntegrationError(error);
        }
        throw error;
      }
    }),

  userPlans: createRateLimitedProtectedProcedure("read").query(async (opts) => {
    noStore();
    const userId = opts.ctx.userId! as string;
    const requestId = opts.ctx.requestId;
    const custom = await db
      .selectFrom("Customer")
      .select([
        "stripeSubscriptionId",
        "stripeCurrentPeriodEnd",
        "stripeCustomerId",
        "stripePriceId",
      ])
      .where("authUserId", "=", userId)
      .executeTakeFirst();
    if (!custom) {
      return;
    }
    // Check if user is on a paid plan.
    const isPaid =
      custom.stripePriceId &&
      custom.stripeCurrentPeriodEnd &&
      custom.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();
    // Find the pricing data corresponding to the custom's plan
    const customPlan =
      pricingData.find(
        (plan) => plan.stripeIds.monthly === custom.stripePriceId,
      ) ??
      pricingData.find(
        (plan) => plan.stripeIds.yearly === custom.stripePriceId,
      );
    const plan = isPaid && customPlan ? customPlan : pricingData[0];

    const interval = isPaid
      ? customPlan?.stripeIds.monthly === custom.stripePriceId
        ? "month"
        : customPlan?.stripeIds.yearly === custom.stripePriceId
          ? "year"
          : null
      : null;
    let isCanceled = false;
    try {
      if (isPaid && custom.stripeSubscriptionId) {
        const stripePlan = await retrieveSubscription(
          custom.stripeSubscriptionId,
          { requestId },
        );
        isCanceled = stripePlan.cancel_at_period_end;
      }
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw handleIntegrationError(error);
      }
    }

    return {
      ...plan,
      ...custom,
      stripeCurrentPeriodEnd: custom.stripeCurrentPeriodEnd?.getTime() ?? 0,
      isPaid,
      interval,
      isCanceled,
    };
  }),
});
