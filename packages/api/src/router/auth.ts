import { unstable_noStore as noStore } from "next/cache";

import { db } from "@saasfly/db";

import {
  createTRPCRouter,
  createRateLimitedProtectedProcedure,
  EndpointType,
} from "../trpc";

export const authRouter = createTRPCRouter({
  mySubscription: createRateLimitedProtectedProcedure("read").query(async (opts) => {
    noStore();
    const userId = opts.ctx.userId as string;
    const requestId = opts.ctx.requestId;
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
  }),
});
