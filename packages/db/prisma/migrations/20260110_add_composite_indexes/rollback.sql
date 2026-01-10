-- Rollback Composite Indexes
-- Migration: 20260110_add_composite_indexes (Rollback)

-- Note: Rolling back indexes is generally safe but may impact query performance
-- Consider the performance implications before running this rollback

-- Drop composite index for K8sClusterConfig
DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_deletedAt_idx";

-- Drop composite index for Customer
DROP INDEX IF EXISTS "Customer_authUserId_stripeCurrentPeriodEnd_idx";

-- Rollback Notes:
-- 1. Removing indexes will increase query execution time for affected operations
-- 2. No data loss occurs when dropping indexes
-- 3. Existing single-column indexes remain intact
-- 4. Re-apply migration to restore performance benefits
