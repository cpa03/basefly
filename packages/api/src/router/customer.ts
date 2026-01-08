import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { db, SubscriptionPlan } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const updateUserNameSchema = z.object({
  name: z.string(),
  userId: z.string(),
});
const insertCustomerSchema = z.object({
  userId: z.string(),
});
export const customerRouter = createTRPCRouter({
  updateUserName: protectedProcedure
    .input(updateUserNameSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const ctxUserId = ctx.userId;
      if (!ctxUserId || userId !== ctxUserId) {
        return { success: false, reason: "no auth" };
      }
      await db
        .updateTable("User")
        .set({
          name: input.name,
        })
        .where("id", "=", userId)
        .execute();
      return { success: true, reason: "" };
    }),

  insertCustomer: protectedProcedure
    .input(insertCustomerSchema)
    .mutation(async ({ input }) => {
      const { userId } = input;
      await db
        .insertInto("Customer")
        .values({
          authUserId: userId,
          plan: SubscriptionPlan.FREE,
        })
        .executeTakeFirst();
    }),

  queryCustomer: protectedProcedure
    .input(insertCustomerSchema)
    .query(async ({ input }) => {
      noStore();
      const { userId } = input;
      return await db
        .selectFrom("Customer")
        .where("authUserId", "=", userId)
        .executeTakeFirst();
    }),
});
