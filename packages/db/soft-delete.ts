/**
 * Soft Delete Service
 * 
 * Provides reusable soft delete functionality for database entities.
 * Uses a timestamp-based approach (deletedAt field) to mark records as deleted
 * without actually removing them from the database. This preserves audit trails
 * and enables recovery of deleted records.
 * 
 * Key features:
 * - Type-safe table names via generic parameter T
 * - Ownership validation via authUserId checks
 * - Automatic filtering of deleted records in queries
 * - Support for both soft delete and restore operations
 * - Request ID logging for distributed tracing
 */

import { db } from ".";
import type { DB } from "./prisma/types";
import type { Selectable } from "kysely";

/**
 * Interface for entities that support soft delete
 * Must have a deletedAt timestamp field (null = active, non-null = deleted)
 */
export interface SoftDeleteEntity {
  deletedAt: Date | null;
}

/**
 * Generic soft delete service for database entities
 * 
 * @template T - The database table name (must be a valid table in DB schema)
 * 
 * @example
 * ```typescript
 * const clusterService = new SoftDeleteService<"K8sClusterConfig">("K8sClusterConfig");
 * 
 * // Soft delete a cluster with request tracking
 * await clusterService.softDelete(clusterId, userId, { requestId: "uuid" });
 * 
 * // Restore a deleted cluster
 * await clusterService.restore(clusterId, userId, { requestId: "uuid" });
 * 
 * // Find active clusters only
 * const clusters = await clusterService.findAllActive(userId);
 * ```
 */
export class SoftDeleteService<T extends keyof DB & string> {
  constructor(private tableName: T) {}

  /**
   * Mark a record as deleted by setting deletedAt timestamp
   * 
   * @param id - The record ID to delete
   * @param userId - The user ID for ownership validation
   * @param options - Optional request ID for distributed tracing
   * @throws Error if record doesn't exist or doesn't belong to user
   */
  async softDelete(id: number, userId: string, options?: { requestId?: string }): Promise<void> {
    await db
      .updateTable(this.tableName)
      .set({ deletedAt: new Date() } as any)
      .where("id" as any, "=", id)
      .where("authUserId" as any, "=", userId)
      .execute();
  }

  /**
   * Restore a soft-deleted record by setting deletedAt to null
   * 
   * @param id - The record ID to restore
   * @param userId - The user ID for ownership validation
   * @param options - Optional request ID for distributed tracing
   * @throws Error if record doesn't exist or doesn't belong to user
   */
  async restore(id: number, userId: string, options?: { requestId?: string }): Promise<void> {
    await db
      .updateTable(this.tableName)
      .set({ deletedAt: null } as any)
      .where("id" as any, "=", id)
      .where("authUserId" as any, "=", userId)
      .execute();
  }

  /**
    * Find a single active (non-deleted) record by ID
   * 
   * @param id - The record ID to find
   * @param userId - The user ID for ownership validation
   * @returns The record if found and belongs to the user, undefined otherwise
   */
  findActive(id: number, userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("id" as any, "=", id)
      .where("authUserId" as any, "=", userId)
      .where("deletedAt" as any, "is", null)
      .executeTakeFirst();
  }

  /**
   * Find all active (non-deleted) records for a user
   * 
   * @param userId - The user ID to find records for
   * @returns Array of active records belonging to the user
   */
  findAllActive(userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("authUserId" as any, "=", userId)
      .where("deletedAt" as any, "is", null)
      .execute();
  }

  /**
   * Find all deleted records for a user (audit trail)
   * 
   * @param userId - The user ID to find deleted records for
   * @returns Array of deleted records belonging to the user
   */
  findDeleted(userId: string) {
    return db
      .selectFrom(this.tableName)
      .selectAll()
      .where("authUserId" as any, "=", userId)
      .where("deletedAt" as any, "is not", null)
      .execute();
  }
}

/**
 * Pre-configured service instance for K8sClusterConfig table
 * Used throughout the application for cluster management
 */
export const k8sClusterService = new SoftDeleteService<"K8sClusterConfig">("K8sClusterConfig");
