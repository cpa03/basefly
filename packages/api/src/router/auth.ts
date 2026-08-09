/**
 * Authentication Router
 *
 * Provides subscription information for authenticated users.
 * All endpoints are rate-limited and require authentication.
 *
 * @module authRouter
 * @see {@link https://docs.saasfly.io/api/auth | Auth API Documentation}
 */

import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { db } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

// Schema for mySubscription query - enforces no input parameters
export const mySubscriptionSchema = z.object({}).strict().optional();

export const authRouter = createTRPCRouter({
  /**
   * Retrieves the authenticated user's current subscription plan.
   *
   * Returns the plan and the current billing period end date, or `null`
   * when no customer record exists for the user yet.
   *
   * @returns Subscription plan info ({ plan, endsAt }) or null
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} INTERNAL_SERVER_ERROR if the query fails
   */
  mySubscription: createRateLimitedProtectedProcedure("read")
    .input(mySubscriptionSchema)
    .query(async (opts) => {
      noStore();
      const userId = opts.ctx.userId;

      if (!userId) {
        throw createApiError(
          ErrorCode.UNAUTHORIZED,
          "User is not authenticated",
        );
      }

      const requestId = opts.ctx.requestId;

      try {
        const customer = await db
          .selectFrom("Customer")
          .select(["plan", "stripeCurrentPeriodEnd"])
          .where("authUserId", "=", userId)
          .executeTakeFirst();

        if (!customer) return null;
        return {
          plan: customer.plan,
          endsAt: customer.stripeCurrentPeriodEnd,
        };
      } catch (error) {
        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to fetch subscription",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to fetch subscription",
          error,
        );
      }
    }),
});
