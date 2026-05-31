/**
 * Customer Management Router
 *
 * Provides CRUD operations for customer records and user profile management.
 * All endpoints are rate-limited and require authentication.
 *
 * @module customerRouter
 * @see {@link https://docs.saasfly.io/api/customer | Customer API Documentation}
 */

import { unstable_noStore as noStore } from "next/cache";

import { db, SubscriptionPlan } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";
import {
  enhancedInsertCustomerSchema,
  enhancedQueryCustomerSchema,
  enhancedUpdateUserNameSchema,
} from "./schemas";

function isUniqueViolation(error: unknown, constraintName?: string): boolean {
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

export const customerRouter = createTRPCRouter({
  /**
   * Updates the authenticated user's display name.
   * User can only update their own name.
   *
   * @param input - User update (userId, name)
   * @returns Success status
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} FORBIDDEN if user tries to update another user's name
   * @throws {TRPCError} BAD_REQUEST if validation fails
   */
  updateUserName: createRateLimitedProtectedProcedure("write")
    .input(enhancedUpdateUserNameSchema)
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
        throw createApiError(
          ErrorCode.UNAUTHORIZED,
          "You are not authorized to update this user's name",
        );
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

  /**
   * Creates a new customer record for the authenticated user.
   * Links the Clerk user to the internal customer system.
   *
   * @param input - Customer creation input (userId)
   * @returns Created customer record
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} FORBIDDEN if user tries to create customer for another user
   * @throws {TRPCError} CONFLICT if customer already exists
   */
  insertCustomer: createRateLimitedProtectedProcedure("write")
    .input(enhancedInsertCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      const ctxUserId = ctx.userId;
      const requestId = ctx.requestId;

      if (!ctxUserId || userId !== ctxUserId) {
        logger.warn(
          { userId, ctxUserId, requestId },
          "Unauthorized customer creation attempt",
        );
        throw createApiError(
          ErrorCode.UNAUTHORIZED,
          "You are not authorized to create a customer for this user",
        );
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

  /**
   * Queries the customer record for the authenticated user.
   * Returns customer details including subscription plan.
   *
   * @param input - Customer query input (userId)
   * @returns Customer record or undefined
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} FORBIDDEN if user tries to query another customer's data
   */
  queryCustomer: createRateLimitedProtectedProcedure("read")
    .input(enhancedQueryCustomerSchema)
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
        throw createApiError(
          ErrorCode.UNAUTHORIZED,
          "You are not authorized to query this customer",
        );
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
