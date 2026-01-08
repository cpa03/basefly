-- Rollback: Revert Soft Delete Pattern
-- Migration: 20240107_implement_soft_delete

-- Step 1: Drop the new indexes
DROP INDEX IF EXISTS "K8sClusterConfig_plan_authUserId_key";
DROP INDEX IF EXISTS "K8sClusterConfig_deletedAt_idx";

-- Step 2: Add back the delete boolean column
ALTER TABLE "K8sClusterConfig"
ADD COLUMN "delete" BOOLEAN DEFAULT false;

-- Step 3: Migrate deletedAt back to delete boolean
-- If deletedAt is not NULL, set delete = true
UPDATE "K8sClusterConfig"
SET "delete" = true
WHERE "deletedAt" IS NOT NULL;

-- Step 4: Remove the deletedAt column
ALTER TABLE "K8sClusterConfig"
DROP COLUMN "deletedAt";
