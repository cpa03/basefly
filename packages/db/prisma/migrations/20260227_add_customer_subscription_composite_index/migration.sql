-- Add Composite Index for Customer Subscription Queries
-- Migration: 20260227_add_customer_subscription_composite_index
-- Description: Add composite index on Customer(authUserId, plan, stripeCurrentPeriodEnd) for subscription status queries

-- Purpose:
-- This composite index optimizes common dashboard query patterns:
-- 1. Fetch a user's subscription details (authUserId + plan + period end)
-- 2. Filter by subscription status (active/expired based on stripeCurrentPeriodEnd)
-- 3. Plan-based access control queries

-- Index: Customer authUserId + plan + stripeCurrentPeriodEnd
-- Covers queries like:
--   SELECT * FROM "Customer" WHERE "authUserId" = ? AND "plan" = ? AND "stripeCurrentPeriodEnd" > NOW()
--   SELECT * FROM "Customer" WHERE "authUserId" = ? ORDER BY "stripeCurrentPeriodEnd" DESC

CREATE INDEX IF NOT EXISTS "Customer_authUserId_plan_stripeCurrentPeriodEnd_idx"
ON "Customer" ("authUserId", "plan", "stripeCurrentPeriodEnd" DESC);

-- Rollback:
-- DROP INDEX IF EXISTS "Customer_authUserId_plan_stripeCurrentPeriodEnd_idx";
