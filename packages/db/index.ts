import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

// =============================================================================
// EXPLICIT BARREL EXPORTS
// =============================================================================
// This file uses explicit named exports instead of `export *` for better
// tree-shaking. Each module's exports are explicitly listed below.
// See Issue #523: Audit and optimize barrel exports for tree-shaking
// =============================================================================

// -----------------------------------------------------------------------------
// Kysely helpers - PostgreSQL JSON helpers
// -----------------------------------------------------------------------------
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

// -----------------------------------------------------------------------------
// prisma/types.ts - Database type definitions
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// prisma/enums.ts - Database enum definitions
// -----------------------------------------------------------------------------
export { SubscriptionPlan, Status } from "./prisma/enums";
export type { SubscriptionPlan as SubscriptionPlanType, Status as StatusType } from "./prisma/enums";

// -----------------------------------------------------------------------------
// soft-delete.ts - Soft delete service for entities
// -----------------------------------------------------------------------------
export type { SoftDeleteEntity } from "./soft-delete";
export { SoftDeleteService, k8sClusterService } from "./soft-delete";

// -----------------------------------------------------------------------------
// user-deletion.ts - User deletion service with cascading
// -----------------------------------------------------------------------------
export { UserDeletionService, userDeletionService } from "./user-deletion";

// -----------------------------------------------------------------------------
// Local exports - Database client instance
// -----------------------------------------------------------------------------
export const db = createKysely<DB>();
