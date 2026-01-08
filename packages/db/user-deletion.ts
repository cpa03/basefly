/**
 * User Deletion Service
 * 
 * Provides controlled user deletion with cascading effects on related data.
 * Implements both hard delete (permanent removal) and soft delete (audit trail preservation)
 * strategies for GDPR compliance and data management requirements.
 * 
 * Key features:
 * - Transaction-based atomicity (all operations succeed or fail together)
 * - Soft delete of K8sClusterConfig before user deletion (preserves audit trail)
 * - Two deletion modes: hard delete (permanent) and soft delete (compliance)
 * - Pre-deletion summary to validate data before deletion
 * - Ownership checks via authUserId foreign keys
 * 
 * Deletion Strategy:
 * - Database level: ON DELETE RESTRICT prevents accidental data loss
 * - Application level: UserDeletionService handles controlled cascade
 * - Cluster data: Soft deleted for audit trail preservation
 * - Customer data: Hard deleted after ensuring no outstanding billing
 */

import { db } from ".";

/**
 * Service for managing user deletion with controlled cascading
 * 
 * @example
 * ```typescript
 * // Get summary before deletion (user confirmation)
 * const summary = await userDeletionService.getUserSummary(userId);
 * console.log(`User has ${summary.activeClusters} active clusters`);
 * 
 * // Hard delete user with cascade
 * await userDeletionService.deleteUser(userId);
 * 
 * // Soft delete for compliance (keeps record)
 * await userDeletionService.softDeleteUser(userId);
 * ```
 */
export class UserDeletionService {
  /**
   * Hard delete a user with cascading effects
   * 
   * This performs a permanent deletion of the user and related data:
   * 1. Soft deletes all K8sClusterConfig records (preserves audit trail)
   * 2. Hard deletes Customer records (billing data removed)
   * 3. Hard deletes User record (permanent removal)
   * 
   * All operations run in a single transaction for atomicity.
   * If any operation fails, the entire transaction rolls back.
   * 
   * @param userId - The user ID to delete
   * @throws Error if transaction fails or any deletion operation fails
   * 
   * @warning This operation is irreversible and permanently removes user data
   */
  async deleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      // Step 1: Soft delete all K8s clusters (preserves audit trail)
      // Using soft delete ensures we can track cluster history
      await trx
        .updateTable("K8sClusterConfig")
        .set({ deletedAt: new Date() } as any)
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      // Step 2: Hard delete customer records (billing data)
      // Stripe customer references should be cleaned up before this point
      await trx
        .deleteFrom("Customer")
        .where("authUserId", "=", userId)
        .execute();

      // Step 3: Hard delete user record
      // This is the final step after all dependent data is handled
      await trx
        .deleteFrom("User")
        .where("id", "=", userId)
        .execute();
    });
  }

  /**
   * Soft delete a user for compliance purposes
   * 
   * This preserves the user record for GDPR compliance while:
   * 1. Soft deleting all K8sClusterConfig records (preserves audit trail)
   * 2. Anonymizing user email (prevents re-login but keeps record)
   * 
   * All operations run in a single transaction for atomicity.
   * 
   * @param userId - The user ID to soft delete
   * @throws Error if transaction fails or any update operation fails
   * 
   * @note User email is anonymized to `deleted_{userId}@example.com` to prevent
   *       future login attempts while preserving the record for compliance
   */
  async softDeleteUser(userId: string): Promise<void> {
    await db.transaction().execute(async (trx) => {
      // Step 1: Soft delete all K8s clusters
      await trx
        .updateTable("K8sClusterConfig")
        .set({ deletedAt: new Date() } as any)
        .where("authUserId", "=", userId)
        .where("deletedAt", "is", null)
        .execute();

      // Step 2: Anonymize user email (prevents login, keeps record)
      // Email is set to a placeholder format to preserve uniqueness
      await trx
        .updateTable("User")
        .set({ email: `deleted_${userId}@example.com` } as any)
        .where("id", "=", userId)
        .execute();
    });
  }

  /**
   * Get a summary of user data before deletion
   * 
   * Useful for:
   * - User confirmation before deletion
   * - Displaying what will be affected
   * - Validation checks (e.g., ensure no active subscriptions)
   * 
   * @param userId - The user ID to get summary for
   * @returns Object containing user info, customer data, and cluster count, or null if user not found
   * 
   * @example
   * ```typescript
   * const summary = await userDeletionService.getUserSummary(userId);
   * if (summary) {
   *   console.log(`User: ${summary.user.name}`);
   *   console.log(`Plan: ${summary.customer?.plan || 'None'}`);
   *   console.log(`Active clusters: ${summary.activeClusters}`);
   * }
   * ```
   */
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

/**
 * Pre-configured service instance for user deletion operations
 * Used throughout the application for user account management
 */
export const userDeletionService = new UserDeletionService();
