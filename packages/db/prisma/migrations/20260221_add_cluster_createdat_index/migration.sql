-- Add Index on K8sClusterConfig.createdAt for Time-Based Queries
-- Migration: 20260221_add_cluster_createdat_index

-- Purpose: Optimize queries that sort or filter by creation date
-- Impact: Faster dashboard views showing recent clusters, time-based filtering

-- Index: K8sClusterConfig.createdAt for time-based sorting/filtering
-- Optimizes queries: ORDER BY "createdAt" DESC, WHERE "createdAt" > ?
-- Used by: Dashboard views, audit queries, time-based filtering
CREATE INDEX IF NOT EXISTS "K8sClusterConfig_createdAt_idx"
ON "K8sClusterConfig"("createdAt");

-- Notes:
-- 1. This index enables efficient sorting of clusters by creation date
-- 2. Supports time-based filtering (e.g., "clusters created in the last 7 days")
-- 3. Common pattern for dashboard views showing recent items first
-- 4. Low write overhead - createdAt is immutable after insert
--
-- Benefits:
-- - O(log n) instead of O(n) for creation date sorting
-- - Efficient range queries on createdAt
-- - Supports pagination with ORDER BY createdAt DESC
-- - Minimal index maintenance (createdAt never changes)
--
-- Use Cases:
-- - Dashboard: "Show my recent clusters"
-- - Admin: "Clusters created this week"
-- - Audit: "Cluster creation timeline"
-- - Analytics: Time-based cluster creation metrics
--
-- Performance Considerations:
-- - Index size: ~8 bytes per row (timestamp)
-- - Write overhead: Minimal (createdAt is set once on insert)
-- - Read benefit: Significant for time-ordered queries
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "K8sClusterConfig_createdAt_idx";
