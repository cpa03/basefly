-- Add Foreign Key Constraints to User Table
-- Migration: 20240107_add_foreign_key_constraints

-- Step 1: Add foreign key to Customer table
-- This ensures referential integrity between Customer and User tables
-- Using RESTRICT to prevent accidental data loss
-- Application layer should handle cleanup via soft delete before cascade

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_authUserId_fkey"
FOREIGN KEY ("authUserId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Step 2: Add foreign key to K8sClusterConfig table
-- This ensures referential integrity between K8sClusterConfig and User tables
-- Using RESTRICT to prevent accidental data loss
-- Application layer should handle cleanup via soft delete before cascade

ALTER TABLE "K8sClusterConfig"
ADD CONSTRAINT "K8sClusterConfig_authUserId_fkey"
FOREIGN KEY ("authUserId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Notes:
-- 1. Both foreign keys use ON DELETE RESTRICT to prevent accidental data loss
-- 2. Application layer should implement soft delete before actual delete
-- 3. This ensures audit trail is preserved
-- 4. ON UPDATE CASCADE allows User ID updates to propagate
-- 5. Consider implementing cascade delete policy in future task
