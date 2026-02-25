-- Rollback: Remove Composite Index for Webhook Event Cleanup
-- Migration: 20260219_add_webhook_cleanup_composite_index

DROP INDEX IF EXISTS "StripeWebhookEvent_processed_createdAt_idx";
