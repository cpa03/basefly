/**
 * @saasfly/db - Row-Level Security (RLS) Middleware
 *
 * This module provides middleware for setting PostgreSQL session variables
 * required by RLS policies for multi-tenant data isolation.
 *
 * RLS policies in migration `20260131_add_row_level_security` depend on:
 *   current_setting('app.current_user_id', true)::text
 *
 * @example
 * ```ts
 * import { setRLSSession, executeWithRLS } from "@saasfly/db/rls";
 *
 * // Set session for current user
 * await setRLSSession(userId);
 *
 * // Execute query with RLS context
 * const clusters = await executeWithRLS(userId, async (db) => {
 *   return await db.selectFrom("K8sClusterConfig").selectAll().execute();
 * });
 * ```
 */

import { type Kysely, sql } from "kysely";

import type { DB } from "./prisma/types";

/**
 * Sets the PostgreSQL session variable `app.current_user_id` for RLS policies.
 *
 * Must be called at the start of each transaction/request to ensure
 * RLS policies can correctly filter data by tenant.
 *
 * @param db - Kysely database instance
 * @param userId - The authenticated user's ID ( Clerk user ID)
 */
export async function setRLSSession(db: Kysely<DB>, userId: string | null): Promise<void> {
  // Handle null/undefined userId - set to empty string so RLS returns no rows
  const sessionValue = userId ?? "";

  await sql`SET LOCAL app.current_user_id = ${sessionValue}`.execute(db);
}

/**
 * Executes a callback within an RLS session context.
 *
 * This wrapper automatically:
 * 1. Sets the `app.current_user_id` session variable
 * 2. Executes the callback
 * 3. Ensures proper handling of authenticated vs unauthenticated users
 *
 * @param userId - The authenticated user's ID (null/undefined for unauthenticated)
 * @param db - Kysely database instance
 * @param callback - Async function to execute with RLS context
 * @returns The result of the callback
 */
export async function executeWithRLS<T>(
  userId: string | null | undefined,
  db: Kysely<DB>,
  callback: (db: Kysely<DB>) => Promise<T>
): Promise<T> {
  // Set the RLS session variable before executing
  await setRLSSession(db, userId);

  // Execute the callback with the RLS context already set
  return callback(db);
}

/**
 * Creates an RLS-enabled database wrapper that automatically sets
 * session variables for all operations.
 *
 * This is useful for integration with tRPC or other frameworks where
 * you want RLS to be automatically applied to all queries.
 *
 * @param db - Kysely database instance
 * @param getUserId - Function that returns the current user ID
 * @returns Wrapped database instance with automatic RLS
 *
 * @example
 * ```ts
 * const rlsDb = createRLSDatabase(db, () => ctx.userId);
 * // All queries through rlsDb will have RLS context set
 * const clusters = await rlsDb.selectFrom("K8sClusterConfig").selectAll().execute();
 * ```
 */
export function createRLSDatabase(
  db: Kysely<DB>,
  getUserId: () => string | null | undefined
): Kysely<DB> {
  // Create a proxy that intercepts execution and sets RLS context
  return new Proxy(db, {
    get(target, prop) {
      const value = target[prop as keyof Kysely<DB>];

      if (typeof value === "function" && (prop === "execute" || prop === "executeTakeFirst" || prop === "executeTakeFirstOrDefault" || prop === "executeBatch")) {
        return async function (...args: unknown[]) {
          const userId = getUserId();
          await setRLSSession(target, userId);
          return (value as (...args: unknown[]) => Promise<unknown>).apply(target, args);
        };
      }

      // For other methods, return the original value but wrapped in a way
      // that sets RLS context when execution happens
      if (typeof value === "object" && value !== null) {
        return new Proxy(value, {
          get(target2, prop2) {
            const method = target2[prop2 as keyof typeof target2];

            if (typeof method === "function") {
              return async function (...args: unknown[]) {
                const userId = getUserId();
                await setRLSSession(target, userId);
                return (method as (...args: unknown[]) => Promise<unknown>).apply(target2, args);
              };
            }

            return method;
          },
        });
      }

      return value;
    },
  });
}

/**
 * RLS context options for fine-grained control
 */
export interface RLSOptions {
  /** Override the user ID for RLS (useful for admin operations) */
  overrideUserId?: string | null;
  /** Skip RLS session setting (for system operations) */
  skipRLS?: boolean;
}

/**
 * Executes a callback with optional RLS context.
 *
 * @param db - Kysely database instance
 * @param userId - The authenticated user's ID
 * @param callback - Async function to execute
 * @param options - RLS configuration options
 */
export async function executeWithOptionalRLS<T>(
  db: Kysely<DB>,
  userId: string | null | undefined,
  callback: (db: Kysely<DB>) => Promise<T>,
  options: RLSOptions = {}
): Promise<T> {
  if (options.skipRLS) {
    // Bypass RLS for system operations (e.g., user deletion service)
    return callback(db);
  }

  // Use overrideUserId if provided (e.g., for admin operations)
  const effectiveUserId = options.overrideUserId !== undefined ? options.overrideUserId : userId;

  return executeWithRLS(effectiveUserId, db, callback);
}
