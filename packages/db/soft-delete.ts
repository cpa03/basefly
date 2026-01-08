import { db } from ".";
import type { DB } from "./prisma/types";
import type { Selectable } from "kysely";

export interface SoftDeleteEntity {
  deletedAt: Date | null;
}

export class SoftDeleteService<T extends keyof DB & string> {
  constructor(private tableName: T) {}

  async softDelete(id: number, userId: string): Promise<void> {
    await db
      .updateTable(this.tableName)
      .set({ deletedAt: new Date() } as any)
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .execute();
  }

  async restore(id: number, userId: string): Promise<void> {
    await db
      .updateTable(this.tableName)
      .set({ deletedAt: null } as any)
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .execute();
  }

  findActive(id: number, userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("id", "=", id)
      .where("authUserId", "=", userId)
      .where("deletedAt", "is", null)
      .executeTakeFirst();
  }

  findAllActive(userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("authUserId", "=", userId)
      .where("deletedAt", "is", null)
      .execute();
  }

  findDeleted(userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("authUserId", "=", userId)
      .where("deletedAt", "is not", null)
      .execute();
  }
}

export const k8sClusterService = new SoftDeleteService<"K8sClusterConfig">("K8sClusterConfig");
