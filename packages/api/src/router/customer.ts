import { unstable_noStore as noStore } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { USER_VALIDATION } from "@saasfly/common";
import { db, SubscriptionPlan } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

function isUniqueViolation(
  error: unknown,
  constraintName?: string,
): boolean {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
  ) {
    const pgError = error as { code: string; constraint?: string };
    if (pgError.code === "23505") {
      if (constraintName) {
        return pgError.constraint === constraintName;
      }
      return true;
    }
  }
  return false;
}

// Enhanced schemas with comprehensive validation using centralized constants
export const updateUserNameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER_VALIDATION.displayName.minLength, "Name cannot be empty")
      .max(
        USER_VALIDATION.displayName.maxLength,
        `Name cannot exceed ${USER_VALIDATION.displayName.maxLength} characters`,
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

      logger.info({ userId, ctxUserId, requestId }, "Updating user name");

      if (!ctxUserId || userId !== ctxUserId) {
        logger.warn(
          { userId, ctxUserId, requestId },
          "Unauthorized user name update attempt",
        );
        return { success: false, reason: "no auth" };
      }

      try {
        await db
          .updateTable("User")
          .set({
            name: input.name,
          })
          .where("id", "=", userId)
          .execute();

        logger.info({ userId, requestId }, "User name updated successfully");

        return { success: true, reason: "" };
      } catch (error) {
        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to update user name",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to update user name",
          error,
        );
      }
    }),

  insertCustomer: createRateLimitedProtectedProcedure("write")
    .input(insertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const ctxUserId = ctx.userId;
      const requestId = ctx.requestId;

      if (!ctxUserId || userId !== ctxUserId) {
        logger.warn(
          { userId, ctxUserId, requestId },
          "Unauthorized customer creation attempt",
        );
        return { success: false, reason: "unauthorized" };
      }

      logger.info({ userId, requestId }, "Creating customer");

      try {
        const result = await db
          .insertInto("Customer")
          .values({
            authUserId: userId,
            plan: SubscriptionPlan.FREE,
          })
          .executeTakeFirst();

        logger.info({ userId, requestId }, "Customer created successfully");

        return result;
      } catch (error) {
        if (isUniqueViolation(error, "Customer_authUserId_unique")) {
          logger.info({ userId, requestId }, "Customer already exists");
          throw createApiError(
            ErrorCode.CONFLICT,
            "Customer already exists for this user",
          );
        }

        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to create customer",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to create customer",
          error,
        );
      }
    }),

  queryCustomer: createRateLimitedProtectedProcedure("read")
    .input(queryCustomerSchema)
    .query(async ({ ctx, input }) => {
      noStore();
      const { userId } = input;
      const ctxUserId = ctx.userId;
      const requestId = ctx.requestId;

      if (!ctxUserId || userId !== ctxUserId) {
        logger.warn(
          { userId, ctxUserId, requestId },
          "Unauthorized customer query attempt",
        );
        return null;
      }

      logger.debug({ userId, requestId }, "Querying customer");

      try {
        return await db
          .selectFrom("Customer")
          .where("authUserId", "=", userId)
          .executeTakeFirst();
      } catch (error) {
        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to query customer",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to query customer",
          error,
        );
      }
    }),
});
