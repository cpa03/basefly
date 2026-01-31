import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { db, SubscriptionPlan } from "@saasfly/db";

import {
  createTRPCRouter,
  createRateLimitedProtectedProcedure,
  EndpointType,
} from "../trpc";

export const updateUserNameSchema = z.object({
  name: z.string().min(1),
  userId: z.string().min(1),
});
export const insertCustomerSchema = z.object({
  userId: z.string().min(1),
});
export const customerRouter = createTRPCRouter({
  updateUserName: createRateLimitedProtectedProcedure("write")
    .input(updateUserNameSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const ctxUserId = ctx.userId;
      const requestId = ctx.requestId;
      if (!ctxUserId || userId !== ctxUserId) {
        return { success: false, reason: "no auth" };
      }
      console.info(JSON.stringify({ level: "info", message: "Updating user name", userId, requestId }));
      await db
        .updateTable("User")
        .set({
          name: input.name,
        })
        .where("id", "=", userId)
        .execute();
      console.info(JSON.stringify({ level: "info", message: "Updated user name", userId, requestId }));
      return { success: true, reason: "" };
    }),

  insertCustomer: createRateLimitedProtectedProcedure("write")
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const requestId = ctx.requestId;
      console.info(JSON.stringify({ level: "info", message: "Inserting customer", userId, requestId }));
      const result = await db
        .insertInto("Customer")
        .values({
          authUserId: userId,
          plan: SubscriptionPlan.FREE,
        })
        .executeTakeFirst();
      console.info(JSON.stringify({ level: "info", message: "Inserted customer", userId, requestId }));
      return result;
    }),

  queryCustomer: createRateLimitedProtectedProcedure("read")
    .input(insertCustomerSchema)
    .query(async ({ ctx, input }) => {
      noStore();
      const { userId } = input;
      const requestId = ctx.requestId;
      console.info(JSON.stringify({ level: "info", message: "Querying customer", userId, requestId }));
      return await db
        .selectFrom("Customer")
        .where("authUserId", "=", userId)
        .executeTakeFirst();
    }),
});
