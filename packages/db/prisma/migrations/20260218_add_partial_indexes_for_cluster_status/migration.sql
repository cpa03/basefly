-- Add Partial Indexes for K8sClusterConfig Query Optimization
-- Migration: 20260218_add_partial_indexes_for_cluster_status

-- Purpose: Optimize common query patterns for active and deleted clusters
-- Impact: Faster queries for user cluster lists, reduced index size

-- Partial Index 1: Active clusters by user
-- Optimizes queries: WHERE "authUserId" = ? AND "deletedAt" IS NULL
-- Used by: findAllActive, findActive, getUserSummary, getClusters
CREATE INDEX "K8sClusterConfig_authUserId_active_idx" 
ON "K8sClusterConfig"("authUserId") 
WHERE "deletedAt" IS NULL;

-- Partial Index 2: Deleted clusters by user
-- Optimizes queries: WHERE "authUserId" = ? AND "deletedAt" IS NOT NULL
-- Used by: findDeleted, audit queries
CREATE INDEX "K8sClusterConfig_authUserId_deleted_idx" 
ON "K8sClusterConfig"("authUserId") 
WHERE "deletedAt" IS NOT NULL;

-- Partial Index 3: Active clusters with status filter
-- Optimizes queries filtering by status on active clusters
-- Used by: Dashboard status filtering, cluster status checks
CREATE INDEX "K8sClusterConfig_status_active_idx" 
ON "K8sClusterConfig"("status") 
WHERE "deletedAt" IS NULL;

-- Notes:
-- 1. Partial indexes only include rows matching the WHERE condition
-- 2. Smaller index size = faster scans and less storage
-- 3. PostgreSQL automatically uses partial indexes when query matches condition
-- 4. These complement existing composite index on (authUserId, deletedAt)
--
-- Benefits:
-- - Active cluster queries (most common) use smaller, focused index
-- - Deleted cluster queries (audit) use dedicated index
-- - Status-filtered queries on active clusters get optimized path
-- - Reduced index maintenance overhead for INSERT/UPDATE
--
-- Performance Considerations:
-- - Partial indexes are smaller than full indexes
-- - Query planner automatically selects appropriate index
-- - No application code changes required
-- - Existing composite index remains for complex queries
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_active_idx";
-- DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_deleted_idx";
-- DROP INDEX IF EXISTS "K8sClusterConfig_status_active_idx";
