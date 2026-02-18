-- Rollback: Remove Index on StripeWebhookEvent.eventType
-- Migration: 20260218_add_webhook_event_type_index (ROLLBACK)

-- Purpose: Revert the eventType index addition if needed
-- Impact: Removes the performance optimization for eventType-based queries

-- Remove the index
DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_idx";

-- Notes:
-- 1. This rollback is safe and will not cause data loss
-- 2. After rollback, eventType queries will use sequential scan
-- 3. Consider performance impact before rolling back in production
