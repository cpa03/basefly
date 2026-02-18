-- Rollback: Remove StripeWebhookEvent Table
-- Migration: 20260131_add_webhook_idempotency

-- Purpose: Revert the webhook idempotency table creation if needed
-- Impact: Removes webhook event tracking and idempotency protection

-- Drop the table (cascade will automatically remove indexes, constraints, and comments)
DROP TABLE IF EXISTS "StripeWebhookEvent" CASCADE;

-- Notes:
-- 1. WARNING: This rollback will DELETE ALL webhook event records
-- 2. After rollback, Stripe webhook idempotency will not be enforced at database level
-- 3. Duplicate webhook processing may occur without this table
-- 4. Consider exporting webhook data before rolling back in production
-- 5. All associated indexes and constraints are dropped automatically with CASCADE
