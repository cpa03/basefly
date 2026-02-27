/**
 * @saasfly/db - Database Access Layer
 *
 * This package provides type-safe database access using Kysely query builder
 * with Prisma-generated types. All exports are explicit for optimal tree-shaking.
 *
 * @example
 * ```ts
 * // Import database instance and types
 * import { db, type User, type K8sClusterConfig } from "@saasfly/db";
 *
 * // Import services
 * import { k8sClusterService, userDeletionService } from "@saasfly/db";
 *
 * // Import enums
 * import { SubscriptionPlan, Status } from "@saasfly/db";
 *
 * // Import RLS middleware for multi-tenant isolation
 * import { rlsTransaction, setRlsSession } from "@saasfly/db";
 * ```
 *
 * @module @saasfly/db
 */

import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

// Kysely helpers for PostgreSQL
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

// Type exports from prisma/types.ts
export type {
  Generated,
  Timestamp,
  Account,
  Customer,
  K8sClusterConfig,
  Session,
  User,
  VerificationToken,
  StripeWebhookEvent,
  DB,
} from "./prisma/types";

// Enum exports from prisma/enums.ts
export { SubscriptionPlan, Status } from "./prisma/enums";
export type {
  SubscriptionPlan as SubscriptionPlanType,
  Status as StatusType,
} from "./prisma/enums";

// Soft delete service exports
export {
  SoftDeleteService,
  k8sClusterService,
} from "./soft-delete";
export type { SoftDeleteEntity } from "./soft-delete";

// User deletion service exports
export {
  UserDeletionService,
  userDeletionService,
} from "./user-deletion";

// RLS middleware exports for multi-tenant isolation
export {
  setRlsSession,
  clearRlsSession,
  rlsTransaction,
  createRlsHelper,
} from "./rls-middleware";
export type { RlsDatabase } from "./rls-middleware";

// Database instance
export const db = createKysely<DB>();
