-- Add Composite Indexes for Query Performance Optimization
-- Migration: 20260110_add_composite_indexes

-- Purpose: Optimize multi-column query patterns identified in API router analysis
-- Impact: Reduces query execution time for common soft-delete and subscription lookup patterns

-- Index 1: Composite index for K8sClusterConfig authUserId + deletedAt
-- Optimizes findAllActive(), findDeleted(), and getUserSummary queries
CREATE INDEX IF NOT EXISTS "K8sClusterConfig_authUserId_deletedAt_idx"
ON "K8sClusterConfig" ("authUserId", "deletedAt");

-- Index 2: Composite index for Customer authUserId + stripeCurrentPeriodEnd
-- Optimizes subscription status checks and Customer queries
CREATE INDEX IF NOT EXISTS "Customer_authUserId_stripeCurrentPeriodEnd_idx"
ON "Customer" ("authUserId", "stripeCurrentPeriodEnd" DESC);

-- Performance Benefits:
-- 1. K8sClusterConfig authUserId + deletedAt index:
--    - Improves queries that filter by user and soft-delete status
--    - Used in 5+ query locations across routers and services
--    - Critical for cluster list and management operations
--
-- 2. Customer authUserId + stripeCurrentPeriodEnd index:
--    - Improves subscription status checks
--    - Used in 6+ query locations across routers
--    - Benefits billing and subscription management operations
--
-- Index Strategy:
-- - Both indexes use high-selectivity columns (authUserId has many distinct values)
-- - DESC order on stripeCurrentPeriodEnd for efficient active subscription checks
-- - IF NOT EXISTS allows safe re-running of migration
--
-- Monitoring Recommendations:
-- - Run EXPLAIN ANALYZE on queries to verify index usage
-- - Monitor index hit ratios in production
-- - Track write performance impact (minimal for this workload)
