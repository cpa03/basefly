-- Add Composite Index on StripeWebhookEvent(eventType, createdAt)
-- Migration: 20260220_add_webhook_eventtype_createdat_index

-- Purpose: Optimize webhook event queries that filter by type and order by time
-- Impact: Faster queries for fetching recent events of a specific type

-- Composite Index: (eventType, createdAt DESC)
-- Optimizes: Queries filtering by eventType with time-based ordering/ranging
-- Used by: Webhook event monitoring, type-specific event history, debugging

-- Create composite index for eventType + createdAt queries
-- DESC order on createdAt optimizes "most recent events" queries
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_eventType_createdAt_idx"
ON "StripeWebhookEvent" ("eventType", "createdAt" DESC);

-- Notes:
-- 1. This complements the existing eventType_idx and eventType_processed_idx indexes
-- 2. The existing indexes cover different query patterns:
--    - eventType_idx: Simple type filtering
--    - eventType_processed_idx: Type + processing status filtering
--    - processed_createdAt_idx: Cleanup queries for processed old events
-- 3. This new index covers: Type filtering + time-based queries (most recent)
--
-- Query patterns optimized:
-- - "Get recent checkout.session.completed events"
-- - "Get all invoice.paid events in the last hour"
-- - "List the last 50 customer.updated events"
--
-- Performance Considerations:
-- - Composite index allows index-only scans for common queries
-- - DESC order matches typical "ORDER BY createdAt DESC" patterns
-- - Minimal write overhead (one additional index entry per insert)
-- - No impact on read queries (query planner selects best index)
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_createdAt_idx";
