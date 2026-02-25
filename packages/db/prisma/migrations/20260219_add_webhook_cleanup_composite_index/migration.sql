-- Add Composite Index for Webhook Event Cleanup Optimization
-- Migration: 20260219_add_webhook_cleanup_composite_index

-- Purpose: Optimize cleanup queries for processed webhook events
-- Impact: Faster cleanup of old processed webhook events, reduced index maintenance

-- Composite Index: (processed, createdAt) for cleanup queries
-- Optimizes queries: WHERE "processed" = true AND "createdAt" < ?
-- Used by: cleanupOldWebhookEvents function in webhook-idempotency.ts
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_processed_createdAt_idx"
ON "StripeWebhookEvent" ("processed", "createdAt");

-- Notes:
-- 1. The processed column has low cardinality (true/false), so it comes first
-- 2. The createdAt column provides the range condition for the cleanup cutoff
-- 3. This composite index is more efficient than two separate indexes for cleanup queries
-- 4. Existing individual indexes remain for other query patterns:
--    - processed (single column) - for general processed status queries
--    - createdAt (single column) - for time-based queries
--    - eventType (single column) - for event type filtering
--
-- Performance Benefits:
-- - Webhook cleanup: Single index scan instead of bitmap AND of two indexes
-- - Reduced I/O: Index contains both columns needed for the query
-- - Better selectivity: Composite index can efficiently filter on both conditions
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "StripeWebhookEvent_processed_createdAt_idx";
