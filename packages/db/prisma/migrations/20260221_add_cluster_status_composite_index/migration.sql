-- Add Composite Partial Index for K8sClusterConfig User+Status Queries
-- Migration: 20260221_add_cluster_status_composite_index

-- Purpose: Optimize common query pattern filtering by user AND status on active clusters
-- Impact: Faster dashboard queries that list clusters by status per user

-- Composite Partial Index: Active clusters by user and status
-- Optimizes queries: WHERE "authUserId" = ? AND "status" = ? AND "deletedAt" IS NULL
-- Used by: Dashboard status filtering, cluster status checks per user
CREATE INDEX IF NOT EXISTS "K8sClusterConfig_authUserId_status_active_idx"
ON "K8sClusterConfig"("authUserId", "status")
WHERE "deletedAt" IS NULL;

-- Notes:
-- 1. This composite index combines the benefits of existing partial indexes:
--    - K8sClusterConfig_authUserId_active_idx (authUserId WHERE deletedAt IS NULL)
--    - K8sClusterConfig_status_active_idx (status WHERE deletedAt IS NULL)
-- 2. The composite index is more efficient for queries filtering by both columns
-- 3. PostgreSQL query planner can still use this index for single-column queries
--    when the leading column (authUserId) is filtered
--
-- Benefits:
-- - Single index lookup for user+status queries on active clusters
-- - Reduced index maintenance compared to two separate indexes
-- - Better index statistics for query planner decisions
-- - Supports common dashboard pattern: "show all RUNNING clusters for user X"
--
-- Performance Considerations:
-- - Composite index size is larger than single-column indexes
-- - But total storage is less than maintaining two separate partial indexes
-- - No impact on INSERT/UPDATE performance for deleted clusters
-- - Query planner will choose the most selective index automatically
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_status_active_idx";
