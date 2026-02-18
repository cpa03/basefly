import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { USER_VALIDATION } from "@saasfly/common";
import { db, SubscriptionPlan } from "@saasfly/db";

import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

// Enhanced schemas with comprehensive validation using centralized constants
export const updateUserNameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER_VALIDATION.displayName.minLength, "Name cannot be empty")
      .max(
        USER_VALIDATION.displayName.maxLength,
        "Name cannot exceed 100 characters",
      ),
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const insertCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const queryCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();
export const customerRouter = createTRPCRouter({
  updateUserName: createRateLimitedProtectedProcedure("write")
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

  insertCustomer: createRateLimitedProtectedProcedure("write")
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const result = await db
        .insertInto("Customer")
        .values({
          authUserId: userId,
          plan: SubscriptionPlan.FREE,
        })
        .executeTakeFirst();
      return result;
    }),

  queryCustomer: createRateLimitedProtectedProcedure("read")
    .input(queryCustomerSchema)
    .query(async ({ ctx, input }) => {
      noStore();
      const { userId } = input;
      return await db
        .selectFrom("Customer")
        .where("authUserId", "=", userId)
        .executeTakeFirst();
    }),
});
