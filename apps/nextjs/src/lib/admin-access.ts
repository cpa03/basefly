/**
 * Admin access control helper for the Next.js app.
 *
 * Enforces database-backed role-based access control (RBAC) for admin pages,
 * mirroring the server-side `adminProcedure` middleware in `packages/api/src/trpc.ts`.
 *
 * Resolution order:
 * 1. Database `User.role` column — grants access if the user has the `ADMIN` role.
 * 2. Legacy `ADMIN_EMAIL` allowlist — migration path for existing admin emails
 *    (see docs/blueprint.md "Role-Based Access Control (RBAC)").
 *
 * Reference: Issue #498 - [P1][Security] Replace email-based admin RBAC with
 * role-based access control.
 */

import { isAdminEmail } from "@saasfly/common";
import { db, rlsTransaction } from "@saasfly/db";

import { logger } from "~/lib/logger";

export interface AdminCheckUser {
  id?: string | null;
  email?: string | null;
}

/**
 * Determine whether the given user has admin access.
 *
 * Checks the database role first (role-based access control). If no database
 * record exists, or the lookup fails, falls back to the legacy `ADMIN_EMAIL`
 * allowlist for backward compatibility.
 *
 * @param user - The authenticated user (from `getCurrentUser`).
 * @returns `true` if the user has the `ADMIN` role or is in the admin email allowlist.
 */
export async function isAdminUser(
  user: AdminCheckUser | null | undefined,
): Promise<boolean> {
  if (!user?.id) {
    return isAdminEmail(user?.email);
  }

  try {
    const userRecord = await rlsTransaction(db, user.id, (trx) =>
      trx
        .selectFrom("User")
        .select("role")
        .where("id", "=", user.id)
        .executeTakeFirst(),
    );

    if (userRecord?.role === "ADMIN") {
      logger.info(
        {
          userId: user.id,
          role: "ADMIN",
          security: true,
          audit: true,
          action: "admin_page_access_granted",
          method: "database_role",
        },
        "Admin page access granted via database role",
      );
      return true;
    }
  } catch (error) {
    logger.error(
      { userId: user.id, error },
      "Failed to check user role from database, falling back to email-based check",
    );
  }

  return isAdminEmail(user.email);
}
