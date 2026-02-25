-- Add Index on StripeWebhookEvent.eventType for Query Performance
-- Migration: 20260218_add_webhook_event_type_index

-- Purpose: Improve query performance when filtering webhook events by type
-- Impact: Faster lookups for specific Stripe event types (e.g., subscription events)

-- Add index on eventType column for efficient filtering
-- This optimizes queries like: SELECT * FROM "StripeWebhookEvent" WHERE "eventType" = 'customer.subscription.updated'
CREATE INDEX "StripeWebhookEvent_eventType_idx" ON "StripeWebhookEvent"("eventType");

-- Notes:
-- 1. The eventType column stores Stripe event types (e.g., customer.subscription.updated)
-- 2. Common queries filter by eventType to find specific event categories
-- 3. This index complements the existing indexes on processed and createdAt
-- 4. Index is particularly useful for debugging and analytics queries
--
-- Use Cases:
-- - Finding all subscription-related events: eventType LIKE 'customer.subscription.%'
-- - Debugging payment issues: eventType = 'checkout.session.completed'
-- - Analytics queries grouping by event type
--
-- Performance Considerations:
-- - Index size is minimal (eventType values are typically 20-40 characters)
-- - No impact on INSERT performance (webhook processing is not write-heavy)
-- - Significant improvement for eventType-based filtering queries
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_idx";
