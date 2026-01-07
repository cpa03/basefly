import { db } from ".";

export interface SoftDeleteEntity {
  deletedAt: Date | null;
}

export class SoftDeleteService {
  constructor(private tableName: string) {}

  async softDelete(id: number, userId: string): Promise<void> {
    await db
      .updateTable(this.tableName as any)
      .set({ deletedAt: new Date() })
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .execute();
  }

  async restore(id: number, userId: string): Promise<void> {
    await db
      .updateTable(this.tableName as any)
      .set({ deletedAt: null })
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .execute();
  }

  findActive(id: number, userId: string) {
    return db
      .selectFrom(this.tableName as any)
      .selectAll()
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .where("deletedAt", "is", null)
      .executeTakeFirst();
  }

  findAllActive(userId: string) {
    return db
      .selectFrom(this.tableName as any)
      .selectAll()
      .where("authUserId", "=", userId)
      .where("deletedAt", "is", null)
      .execute();
  }

  findDeleted(userId: string) {
    return db
      .selectFrom(this.tableName as any)
      .selectAll()
      .where("authUserId", "=", userId)
      .where("deletedAt", "is not", null)
      .execute();
  }
}

export const k8sClusterService = new SoftDeleteService("K8sClusterConfig");
