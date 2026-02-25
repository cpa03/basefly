-- Rollback: Remove Composite Index for StripeWebhookEvent eventType and processed
-- Migration: 20260220_add_webhook_event_type_processed_index

DROP INDEX IF EXISTS "StripeWebhookEvent_eventType_processed_idx";
