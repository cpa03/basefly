import { db } from ".";

export class UserDeletionService {
  async deleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("K8sClusterConfig" as any)
        .set({ deletedAt: new Date() })
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      await trx
        .deleteFrom("Customer" as any)
        .where("authUserId", "=", userId)
        .execute();

      await trx
        .deleteFrom("User" as any)
        .where("id", "=", userId)
        .execute();
    });
  }

  async softDeleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("K8sClusterConfig" as any)
        .set({ deletedAt: new Date() })
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      await trx
        .updateTable("User" as any)
        .set({ email: `deleted_${userId}@example.com` })
        .where("id", "=", userId)
        .execute();
    });
  }

  async getUserSummary(userId: string) {
    const user = await db
      .selectFrom("User" as any)
      .select(["id", "name", "email", "image"])
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    const customer = await db
      .selectFrom("Customer" as any)
      .selectAll()
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    const clusters = await db
      .selectFrom("K8sClusterConfig" as any)
      .selectAll()
      .where("authUserId", "=", userId)
      .where("deletedAt", "is", null)
      .execute();

    return {
      user,
      customer,
      activeClusters: clusters.length,
      clusters,
    };
  }
}

export const userDeletionService = new UserDeletionService();
