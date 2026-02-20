-- Rollback: Remove Composite Index on StripeWebhookEvent(eventType, createdAt)
-- Migration: 20260220_add_webhook_eventtype_createdat_index (rollback)

-- Purpose: Remove the composite index added for eventType + createdAt optimization
-- Use this if the index causes unexpected performance issues

-- Remove the composite index
DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_createdAt_idx";
