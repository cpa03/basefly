-- Rollback: Remove Foreign Key Constraints from User Table

-- Step 1: Remove foreign key from Customer table
ALTER TABLE "Customer"
DROP CONSTRAINT IF EXISTS "Customer_authUserId_fkey";

-- Step 2: Remove foreign key from K8sClusterConfig table
ALTER TABLE "K8sClusterConfig"
DROP CONSTRAINT IF EXISTS "K8sClusterConfig_authUserId_fkey";
