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
 * - Request ID support for distributed tracing (passed to callers for logging)
 */

import { db } from ".";
import { logger } from "./logger";
import type { DB } from "./prisma/types";

/**
 * Interface for entities that support soft delete
 * Must have a deletedAt timestamp field (null = active, non-null = deleted)
 */
export interface SoftDeleteEntity {
  deletedAt: Date | null;
}

// Kysely requires dynamic table references to use type assertions
// These helpers centralize the type casting needed for dynamic table operations
const createSoftDeleteData = () => ({ deletedAt: new Date() });
const createRestoreData = () => ({ deletedAt: null });

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
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
export class SoftDeleteService<T extends keyof DB> {
  constructor(private tableName: T) {}

  /**
   * Mark a record as deleted by setting deletedAt timestamp
   *
   * @param id - The record ID to delete
   * @param userId - The user ID for ownership validation
   * @param options - Optional request ID for distributed tracing (passed to caller)
   * @throws Error if record doesn't exist or doesn't belong to user
   */
  async softDelete(
    id: number,
    userId: string,
    options?: { requestId?: string },
  ): Promise<void> {
    const { requestId } = options ?? {};
    logger.info("Starting soft delete operation", {
      requestId,
      table: this.tableName,
      recordId: id,
      userId,
    });

    try {
      await db
        .updateTable(this.tableName)
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .set(createSoftDeleteData())
        .where("id", "=", id)
        .where("authUserId", "=", userId)
        .execute();

      logger.info("Soft delete completed", {
        requestId,
        table: this.tableName,
        recordId: id,
      });
    } catch (error) {
      logger.error("Soft delete failed", error, {
        requestId,
        table: this.tableName,
        recordId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Restore a soft-deleted record by setting deletedAt to null
   *
   * @param id - The record ID to restore
   * @param userId - The user ID for ownership validation
   * @param options - Optional request ID for distributed tracing (passed to caller)
   * @throws Error if record doesn't exist or doesn't belong to user
   */
  async restore(
    id: number,
    userId: string,
    options?: { requestId?: string },
  ): Promise<void> {
    const { requestId } = options ?? {};
    logger.info("Starting restore operation", {
      requestId,
      table: this.tableName,
      recordId: id,
      userId,
    });

    try {
      await db
        .updateTable(this.tableName)
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .set(createRestoreData())
        .where("id", "=", id)
        .where("authUserId", "=", userId)
        .execute();

      logger.info("Restore completed", {
        requestId,
        table: this.tableName,
        recordId: id,
      });
    } catch (error) {
      logger.error("Restore failed", error, {
        requestId,
        table: this.tableName,
        recordId: id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Find a single active (non-deleted) record by ID
   *
   * @param id - The record ID to find
   * @param userId - The user ID for ownership validation
   * @returns The record if found and belongs to the user, undefined otherwise
   */
  findActive(id: number, userId: string) {
    return (
      db
        .selectFrom(this.tableName)
        .selectAll()
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .where("id", "=", id)
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .executeTakeFirst()
    );
  }

  /**
   * Find all active (non-deleted) records for a user
   *
   * @param userId - The user ID to find records for
   * @returns Array of active records belonging to the user
   */
  findAllActive(userId: string) {
    return (
      db
        .selectFrom(this.tableName)
        .selectAll()
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute()
    );
  }

  /**
   * Find all deleted records for a user (audit trail)
   *
   * @param userId - The user ID to find deleted records for
   * @returns Array of deleted records belonging to the user
   */
  findDeleted(userId: string) {
    return (
      db
        .selectFrom(this.tableName)
        .selectAll()
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .where("authUserId", "=", userId)
        .where("deletedAt", "is not", null)
        .execute()
    );
  }

  /**
   * Count all active (non-deleted) records for a user
   *
   * Useful for pagination, dashboard stats, and admin queries.
   * Uses the existing index on (authUserId, deletedAt) for optimal performance.
   *
   * @param userId - The user ID to count records for
   * @returns The count of active records belonging to the user
   *
   * @example
   * ```typescript
   * const activeCount = await k8sClusterService.countActive(userId);
   * console.log(`User has ${activeCount} active clusters`);
   * ```
   */
  countActive(userId: string) {
    return (
      db
        .selectFrom(this.tableName)
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst()
        .then((result) => Number(result?.count ?? 0))
    );
  }

  /**
   * Count all deleted records for a user (audit trail)
   *
   * Useful for admin dashboards and compliance reporting.
   * Uses the existing index on (authUserId, deletedAt) for optimal performance.
   *
   * @param userId - The user ID to count deleted records for
   * @returns The count of deleted records belonging to the user
   *
   * @example
   * ```typescript
   * const deletedCount = await k8sClusterService.countDeleted(userId);
   * console.log(`User has ${deletedCount} deleted clusters`);
   * ```
   */
  countDeleted(userId: string) {
    return (
      db
        .selectFrom(this.tableName)
        // @ts-expect-error Kysely dynamic table/column requires type assertion
        .where("authUserId", "=", userId)
        .where("deletedAt", "is not", null)
        .select((eb) => eb.fn.count("id").as("count"))
        .executeTakeFirst()
        .then((result) => Number(result?.count ?? 0))
    );
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

/**
 * Pre-configured service instance for K8sClusterConfig table
 * Used throughout the application for cluster management
 */
export const k8sClusterService = new SoftDeleteService<"K8sClusterConfig">(
  "K8sClusterConfig",
);
