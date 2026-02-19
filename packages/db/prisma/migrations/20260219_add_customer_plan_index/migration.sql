-- Add Index for Customer.plan Query Optimization
-- Migration: 20260219_add_customer_plan_index

-- Purpose: Optimize query performance for subscription plan filtering and analytics
-- Impact: Faster queries for plan-based filtering, subscription management, and admin dashboard

-- Index: Customer.plan for subscription tier queries
-- Optimizes queries: WHERE "plan" = ?
-- Used by: Subscription filtering, plan-based analytics, admin dashboard plan counts
CREATE INDEX IF NOT EXISTS "Customer_plan_idx"
ON "Customer" ("plan");

-- Notes:
-- 1. The plan column stores subscription tiers (FREE, PRO, BUSINESS)
-- 2. Common query patterns include filtering customers by plan tier
-- 3. Admin dashboard queries often aggregate by plan type
-- 4. Existing indexes:
--    - authUserId (single column)
--    - stripeCustomerId (unique)
--    - stripeSubscriptionId (unique)
--    - [authUserId, stripeCurrentPeriodEnd] (composite)
--
-- Performance Benefits:
-- - Plan-based customer filtering: O(log n) instead of O(n) table scan
-- - Admin dashboard plan counts: Faster aggregation queries
-- - Subscription tier reports: Efficient plan-based grouping
--
-- Index Strategy:
-- - Uses IF NOT EXISTS for idempotency
-- - Single-column index optimized for plan equality checks
-- - Low write overhead (plan changes are infrequent)
-- - Small index size (only 3 distinct values: FREE, PRO, BUSINESS)
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "Customer_plan_idx";
