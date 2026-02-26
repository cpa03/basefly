-- Rollback: Remove StripeWebhookEvent updatedAt Trigger
-- Migration: 20260219_add_webhook_updated_at_trigger

-- Remove trigger
DROP TRIGGER IF EXISTS "trigger_update_stripewebhookevent_updated_at" ON "StripeWebhookEvent";

-- Remove function
DROP FUNCTION IF EXISTS "update_stripewebhookevent_updated_at"();
