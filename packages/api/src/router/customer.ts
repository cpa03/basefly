import { unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

import { USER_VALIDATION } from "@saasfly/common";
import { db, SubscriptionPlan } from "@saasfly/db";

import { logger } from "../logger";
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
      const requestId = ctx.requestId;

      logger.info(
        {
          userId,
          ctxUserId,
          requestId,
        },
        "Updating user name",
      );

      if (!ctxUserId || userId !== ctxUserId) {
        logger.warn(
          {
            userId,
            ctxUserId,
            requestId,
          },
          "Unauthorized user name update attempt",
        );
        return { success: false, reason: "no auth" };
      }

      await db
        .updateTable("User")
        .set({
          name: input.name,
        })
        .where("id", "=", userId)
        .execute();

      logger.info(
        {
          userId,
          requestId,
        },
        "User name updated successfully",
      );

      return { success: true, reason: "" };
    }),

  insertCustomer: createRateLimitedProtectedProcedure("write")
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const requestId = ctx.requestId;

      logger.info(
        {
          userId,
          requestId,
        },
        "Creating customer",
      );

      const result = await db
        .insertInto("Customer")
        .values({
          authUserId: userId,
          plan: SubscriptionPlan.FREE,
        })
        .executeTakeFirst();

      logger.info(
        {
          userId,
          requestId,
        },
        "Customer created successfully",
      );

      return result;
    }),

  queryCustomer: createRateLimitedProtectedProcedure("read")
    .input(queryCustomerSchema)
    .query(async ({ ctx, input }) => {
      noStore();
      const { userId } = input;
      const requestId = ctx.requestId;

      logger.debug(
        {
          userId,
          requestId,
        },
        "Querying customer",
      );

      return await db
        .selectFrom("Customer")
        .where("authUserId", "=", userId)
        .executeTakeFirst();
    }),
});
