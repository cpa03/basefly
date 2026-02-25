-- Add Composite Index for StripeWebhookEvent eventType and processed
-- Migration: 20260220_add_webhook_event_type_processed_index

-- Purpose: Optimize queries filtering by event type AND processing status
-- Impact: Faster webhook event lookups when filtering by specific event types and processed state

-- Composite Index: eventType + processed
-- Optimizes queries: WHERE "eventType" = ? AND "processed" = ?
-- Used by: Webhook event filtering, dashboard event lists, event type-specific processing
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_eventType_processed_idx"
ON "StripeWebhookEvent"("eventType", "processed");

-- Notes:
-- 1. This composite index complements existing single-column indexes
-- 2. Existing indexes: eventType (single), processed (single), (processed, createdAt)
-- 3. This new index is optimal for queries filtering by both eventType and processed
-- 4. Query planner can use this index for:
--    - WHERE "eventType" = 'customer.subscription.updated' AND "processed" = false
--    - WHERE "eventType" = 'checkout.session.completed' AND "processed" = true
--    - WHERE "eventType" = 'invoice.paid' (index prefix scan)
--
-- Benefits:
-- - Faster dashboard queries showing unprocessed events by type
-- - Optimized webhook processing when filtering by event type
-- - Reduced IO for event type-specific monitoring
-- - Better performance for analytics queries grouping by event type and status
--
-- Performance Considerations:
-- - Minimal overhead (composite index on two columns)
-- - Smaller than separate indexes combined
-- - Write impact is negligible (webhook events are write-once, update-once)
-- - Query planner automatically selects this index when appropriate
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_processed_idx";
