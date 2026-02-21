import { db } from "@saasfly/db";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
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
