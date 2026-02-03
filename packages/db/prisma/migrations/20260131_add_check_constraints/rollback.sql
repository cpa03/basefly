-- Rollback: Remove Check Constraints
-- Migration: 20260131_add_check_constraints

-- Remove all check constraints added in the migration

ALTER TABLE "K8sClusterConfig"
DROP CONSTRAINT IF EXISTS "K8sClusterConfig_name_not_empty";

ALTER TABLE "K8sClusterConfig"
DROP CONSTRAINT IF EXISTS "K8sClusterConfig_name_max_length";

ALTER TABLE "K8sClusterConfig"
DROP CONSTRAINT IF EXISTS "K8sClusterConfig_location_not_empty";

ALTER TABLE "K8sClusterConfig"
DROP CONSTRAINT IF EXISTS "K8sClusterConfig_location_max_length";

ALTER TABLE "Customer"
DROP CONSTRAINT IF EXISTS "Customer_stripeCustomerId_format";

ALTER TABLE "Customer"
DROP CONSTRAINT IF EXISTS "Customer_stripeSubscriptionId_format";

-- Notes:
-- 1. IF EXISTS ensures safe rollback even if constraints were already removed
-- 2. Removing constraints reverts to application-level validation only
-- 3. Existing data is not affected by removing constraints
