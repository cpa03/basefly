import { db } from "@saasfly/db";

import { createRateLimitedAdminProcedure, createTRPCRouter } from "../trpc";

/**
 * Admin router with rate-limited endpoints.
 * Uses "read" rate limit for stats queries (100 requests/minute).
 * Admin endpoints are already protected by authentication and admin role checks.
 */
export const adminRouter = createTRPCRouter({
  /**
   * Retrieves aggregate statistics for the admin dashboard.
   * Returns counts of total users, active clusters, and paid subscriptions.
   * 
   * @returns Dashboard statistics (totalUsers, totalClusters, activeSubscriptions)
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} FORBIDDEN if user is not an admin
   */
getStats: createRateLimitedAdminProcedure("read").query(async () => {
    const [totalUsers, totalClusters, activeSubscriptions] = await Promise.all([
      db
        .selectFrom("User")
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst(),
      db
        .selectFrom("K8sClusterConfig")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("deletedAt", "is", null)
        .executeTakeFirst(),
      db
        .selectFrom("Customer")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("stripeSubscriptionId", "is not", null)
        .executeTakeFirst(),
    ]);

    return {
      totalUsers: Number(totalUsers?.count ?? 0),
      totalClusters: Number(totalClusters?.count ?? 0),
      activeSubscriptions: Number(activeSubscriptions?.count ?? 0),
      recentActivity: 0,
    };
  }),
});
