/**
 * RLS (Row-Level Security) Middleware for Multi-Tenant Isolation
 *
 * This module provides functions to set the PostgreSQL session variable
 * `app.current_user_id` which is used by RLS policies to enforce
 * tenant isolation at the database level.
 *
 * RLS Policies Reference:
 * - K8sClusterConfig: Policies use `authUserId = current_setting('app.current_user_id', true)`
 * - Customer: Policies use `authUserId = current_setting('app.current_user_id', true)`
 * - User: Policies use `id = current_setting('app.current_user_id', true)`
 *
 * Usage:
 * ```ts
 * import { rlsTransaction, setRlsSession, db } from "@saasfly/db";
 *
 * // Set session variable before queries
 * await setRlsSession(db, userId);
 *
 * // Or use transaction wrapper that auto-sets the session
 * const result = await rlsTransaction(db, userId, async (trx) => {
 *   // Queries will have RLS context
 *   return await trx.selectFrom("K8sClusterConfig").selectAll().execute();
 * });
 * ```
 *
 * @module @saasfly/db
 */

import { sql, type Kysely } from "kysely";

import { logger } from "./logger";
import type { DB } from "./prisma/types";

/**
 * Sets the PostgreSQL session variable `app.current_user_id` for RLS policies.
 *
 * This function MUST be called before any database queries that should be
 * subject to Row-Level Security policies. It sets the context for the
 * current user/tenant so that RLS policies can correctly filter data.
 *
 * @param db - Kysely database instance
 * @param userId - The authenticated user's ID (from Clerk)
 * @returns Promise that resolves when the session variable is set
 *
 * @example
 * ```ts
 * const { userId } = await getAuth();
 * if (userId) {
 *   await setRlsSession(db, userId);
 * }
 * ```
 */
export async function setRlsSession(
  db: Kysely<DB>,
  userId: string,
): Promise<void> {
  try {
    // Use SET LOCAL for transaction-scoped setting
    // This ensures the variable is reset after transaction ends
    await sql`SET LOCAL app.current_user_id = ${userId}`.execute(db);
    logger.info("RLS session variable set", { userId });
  } catch (error) {
    logger.error("Failed to set RLS session variable", error, { userId });
    throw error;
  }
}

/**
 * Clears the RLS session variable (sets to empty string).
 *
 * Use this for public/unauthenticated operations where RLS should not apply.
 *
 * @param db - Kysely database instance
 * @returns Promise that resolves when the session variable is cleared
 */
export async function clearRlsSession(db: Kysely<DB>): Promise<void> {
  try {
    await sql`SET LOCAL app.current_user_id = ''`.execute(db);
    logger.info("RLS session variable cleared");
  } catch (error) {
    logger.error("Failed to clear RLS session variable", error);
    throw error;
  }
}

/**
 * Executes a callback within a transaction with RLS session set.
 *
 * This is the recommended way to perform multiple database operations
 * that need RLS context. The session variable is automatically set
 * at the start of the transaction and scoped to that transaction.
 *
 * @param db - Kysely database instance
 * @param userId - The authenticated user's ID (from Clerk)
 * @param callback - Async callback to execute within the transaction
 * @returns Promise that resolves with the callback's return value
 *
 * @example
 * ```ts
 * const { userId } = await getAuth();
 * const result = await rlsTransaction(db, userId, async (trx) => {
 *   return await trx
 *     .selectFrom("K8sClusterConfig")
 *     .selectAll()
 *     .execute();
 * });
 * ```
 */
export async function rlsTransaction<T>(
  db: Kysely<DB>,
  userId: string,
  callback: (trx: Kysely<DB>) => Promise<T>,
): Promise<T> {
  return await db.transaction().execute(async (trx) => {
    // Set RLS session variable within this transaction
    await sql`SET LOCAL app.current_user_id = ${userId}`.execute(trx);
    logger.info("RLS session variable set in transaction", { userId });

    // Execute the callback with the transaction
    return await callback(trx);
  });
}

/**
 * Creates an RLS-aware database helper that automatically sets session context.
 *
 * This provides a simpler API for operations that always need RLS context,
 * like protected tRPC procedures where userId is always available.
 *
 * @param db - Kysely database instance
 * @param userId - The authenticated user's ID (from Clerk)
 * @returns Object with `execute` and `query` methods that auto-set RLS context
 *
 * @example
 * ```ts
 * const rlsDb = createRlsHelper(db, userId);
 *
 * // Simple query - automatically sets RLS context
 * const clusters = await rlsDb.execute((trx) =>
 *   trx.selectFrom("K8sClusterConfig").selectAll().execute()
 * );
 * ```
 */
export function createRlsHelper(db: Kysely<DB>, userId: string) {
  return {
    /**
     * Execute a callback with RLS session set.
     * Wrapper around rlsTransaction for simpler usage.
     */
    async execute<T>(callback: (trx: Kysely<DB>) => Promise<T>): Promise<T> {
      return rlsTransaction(db, userId, callback);
    },

    /**
     * Execute a single query with RLS session set.
     * Convenience method for single operations.
     */
    async query<T>(queryFn: (trx: Kysely<DB>) => Promise<T>): Promise<T> {
      return rlsTransaction(db, userId, queryFn);
    },
  };
}

/**
 * Type for RLS-enabled database operations
 */
export type RlsDatabase = {
  /**
   * Execute operations within RLS context
   */
  rlsExecute<T>(
    userId: string,
    callback: (trx: Kysely<DB>) => Promise<T>,
  ): Promise<T>;
};
