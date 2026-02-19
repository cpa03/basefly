import { unstable_noStore as noStore } from "next/cache";

import { db } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

export const authRouter = createTRPCRouter({
  mySubscription: createRateLimitedProtectedProcedure("read").query(
    async (opts) => {
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
    },
  ),
});
