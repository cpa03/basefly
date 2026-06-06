-- Add Composite Indexes for Customer Subscription Analytics Queries
-- Migration: 20260606_add_customer_subscription_plan_period_index
-- Description: Add composite index on Customer(plan, stripeCurrentPeriodEnd) for cross-customer
-- subscription analytics, and standalone index on stripeCurrentPeriodEnd for time-range queries.

-- Purpose:
-- These indexes optimize admin dashboard and analytics query patterns:
-- 1. Find all customers with expiring subscriptions across all plans (admin notifications)
-- 2. Count active subscriptions by plan tier for reporting
-- 3. Filter customers whose subscription period is ending within a date range
-- 4. Support analytics queries that don't filter by a specific authUserId

-- Index: Customer plan + stripeCurrentPeriodEnd
-- Covers queries like:
--   SELECT * FROM "Customer" WHERE "plan" = 'PRO' AND "stripeCurrentPeriodEnd" < NOW()
--   SELECT * FROM "Customer" WHERE "plan" = 'BUSINESS' AND "stripeCurrentPeriodEnd" BETWEEN ? AND ?
--   SELECT count(*) FROM "Customer" WHERE "plan" IS NOT NULL AND "stripeCurrentPeriodEnd" > NOW()

CREATE INDEX IF NOT EXISTS "Customer_plan_stripeCurrentPeriodEnd_idx"
ON "Customer" ("plan", "stripeCurrentPeriodEnd" DESC);

-- Index: Customer stripeCurrentPeriodEnd (standalone)
-- Optimizes queries filtering by subscription period alone:
--   SELECT * FROM "Customer" WHERE "stripeCurrentPeriodEnd" < NOW()
--   SELECT * FROM "Customer" ORDER BY "stripeCurrentPeriodEnd" DESC LIMIT 50

CREATE INDEX IF NOT EXISTS "Customer_stripeCurrentPeriodEnd_idx"
ON "Customer" ("stripeCurrentPeriodEnd" DESC);

-- Rollback:
-- DROP INDEX IF EXISTS "Customer_plan_stripeCurrentPeriodEnd_idx";
-- DROP INDEX IF EXISTS "Customer_stripeCurrentPeriodEnd_idx";
