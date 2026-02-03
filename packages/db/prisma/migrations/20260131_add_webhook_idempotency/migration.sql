-- Add Webhook Idempotency Table for Stripe Events
-- Migration: 20260131_add_webhook_idempotency

-- Purpose: Track processed Stripe webhook events to prevent duplicate processing
-- Impact: Ensures idempotent webhook handling, prevents duplicate database updates

-- Step 1: Create StripeWebhookEvent table
CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add primary key constraint
ALTER TABLE "StripeWebhookEvent"
  ADD CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id");

-- Step 3: Add unique constraint on id column (Stripe event IDs are globally unique)
-- This ensures the same webhook event cannot be inserted twice
CREATE UNIQUE INDEX "StripeWebhookEvent_id_key" ON "StripeWebhookEvent"("id");

-- Step 4: Add index on processed column for efficient querying
-- Allows quick lookup of unprocessed/processed webhooks
CREATE INDEX "StripeWebhookEvent_processed_idx" ON "StripeWebhookEvent"("processed");

-- Step 5: Add index on createdAt column for cleanup queries
-- Enables efficient deletion of old processed webhooks
CREATE INDEX "StripeWebhookEvent_createdAt_idx" ON "StripeWebhookEvent"("createdAt");

-- Step 6: Add check constraint for eventType
-- Validates that event types match expected Stripe event formats
ALTER TABLE "StripeWebhookEvent"
  ADD CONSTRAINT "StripeWebhookEvent_eventType_format"
  CHECK ("eventType" ~ '^[a-z]+\.[a-z_]+$');

-- Step 7: Add comment on table for documentation
COMMENT ON TABLE "StripeWebhookEvent" IS
  'Tracks processed Stripe webhook events for idempotency.
   Each Stripe event ID is stored to prevent duplicate processing.
   Stripe may redeliver the same event multiple times.';

-- Notes:
-- 1. The id field uses Stripe's globally unique event ID (evt_*)
-- 2. eventType stores the Stripe event type (e.g., checkout.session.completed)
-- 3. processed flag indicates if the event has been successfully processed
-- 4. createdAt/updatedAt timestamps track when the event was received
-- 5. Unique constraint on id ensures no duplicate events can be inserted
-- 6. Indexes optimize queries for duplicate checking and cleanup
--
-- Idempotency Workflow:
-- 1. Webhook received with event.id
-- 2. Attempt to insert into StripeWebhookEvent table
-- 3. If unique constraint violation → event already processed → skip
-- 4. If insert succeeds → proceed to process event
-- 5. Mark processed = true after successful processing
--
-- Benefits:
-- - Prevents duplicate database updates
-- - Prevents duplicate charges (checkout.session.completed)
-- - Provides audit trail of all processed webhooks
-- - Enables cleanup of old events (e.g., keep 90 days)
--
-- Performance Considerations:
-- - Unique index check is O(1) for duplicate detection
-- - Table grows linearly with webhook volume
-- - Should periodically delete old processed events (e.g., older than 90 days)
--
-- Rollback Strategy:
-- DROP TABLE IF EXISTS "StripeWebhookEvent";
