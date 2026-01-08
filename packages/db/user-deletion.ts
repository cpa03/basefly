import { db } from ".";

export class UserDeletionService {
  async deleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("K8sClusterConfig")
        .set({ deletedAt: new Date() } as any)
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      await trx
        .deleteFrom("Customer")
        .where("authUserId", "=", userId)
        .execute();

      await trx
        .deleteFrom("User")
        .where("id", "=", userId)
        .execute();
    });
  }

  async softDeleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable("K8sClusterConfig")
        .set({ deletedAt: new Date() } as any)
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      await trx
        .updateTable("User")
        .set({ email: `deleted_${userId}@example.com` } as any)
        .where("id", "=", userId)
        .execute();
    });
  }

  async getUserSummary(userId: string) {
    const user = await db
      .selectFrom("User")
      .select(["id", "name", "email", "image"])
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    const customer = await db
      .selectFrom("Customer")
      .selectAll()
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    const clusters = await db
      .selectFrom("K8sClusterConfig")
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
