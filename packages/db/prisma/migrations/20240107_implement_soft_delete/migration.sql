-- Implement Soft Delete Pattern with deletedAt Timestamp
-- Migration: 20240107_implement_soft_delete

-- Step 1: Add deletedAt column to K8sClusterConfig
ALTER TABLE "K8sClusterConfig"
ADD COLUMN "deletedAt" TIMESTAMP(3) DEFAULT NULL;

-- Step 2: Migrate existing delete boolean values to deletedAt
-- If delete = true, set deletedAt to now()
-- If delete = false or NULL, leave deletedAt as NULL
UPDATE "K8sClusterConfig"
SET "deletedAt" = CURRENT_TIMESTAMP
WHERE "delete" = true;

-- Step 3: Remove the old delete boolean column
ALTER TABLE "K8sClusterConfig"
DROP COLUMN "delete";

-- Step 4: Create partial unique index for non-deleted clusters
-- This ensures uniqueness only among active (not deleted) records
CREATE UNIQUE INDEX "K8sClusterConfig_plan_authUserId_key"
ON "K8sClusterConfig" ("plan", "authUserId")
WHERE "deletedAt" IS NULL;

-- Step 5: Create index on deletedAt for efficient filtering
CREATE INDEX "K8sClusterConfig_deletedAt_idx"
ON "K8sClusterConfig" ("deletedAt");

-- Notes:
-- 1. deletedAt = NULL means record is active
-- 2. deletedAt != NULL means record is soft-deleted
-- 3. Partial unique index only applies to active records
-- 4. All queries should filter WHERE deletedAt IS NULL
-- 5. Application layer should use helper functions for soft delete
