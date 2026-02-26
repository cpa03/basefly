-- Add Database Trigger for StripeWebhookEvent updatedAt
-- Migration: 20260219_add_webhook_updated_at_trigger

-- Purpose: Automatically update updatedAt timestamp on StripeWebhookEvent updates
-- Impact: Ensures data consistency with K8sClusterConfig and Customer patterns

-- Trigger: Automatically update updatedAt timestamp on StripeWebhookEvent updates
-- This aligns with the existing trigger pattern for K8sClusterConfig and Customer
CREATE OR REPLACE FUNCTION update_stripewebhookevent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stripewebhookevent_updated_at
BEFORE UPDATE ON "StripeWebhookEvent"
FOR EACH ROW
EXECUTE FUNCTION update_stripewebhookevent_updated_at();

-- Notes:
-- 1. This trigger ensures updatedAt is always accurate on StripeWebhookEvent updates
-- 2. Consistent with existing triggers on K8sClusterConfig and Customer tables
-- 3. The StripeWebhookEvent table has an updatedAt field but lacked this trigger
-- 4. No application code changes needed - trigger fires automatically on UPDATE
--
-- Benefits:
-- - Reduces application code complexity (no manual updatedAt management)
-- - Guarantees data consistency (triggers always execute)
-- - Prevents human error (timestamps never forgotten)
-- - Improves audit trail accuracy (timestamps always reflect last update)
--
-- Performance Considerations:
-- - Minimal overhead (simple timestamp assignment)
-- - Trigger executes in same transaction (no additional round trips)
-- - Only fires on UPDATE operations (no impact on SELECT/INSERT)
--
-- Rollback Strategy:
-- DROP TRIGGER IF EXISTS "trigger_update_stripewebhookevent_updated_at" ON "StripeWebhookEvent";
-- DROP FUNCTION IF EXISTS "update_stripewebhookevent_updated_at"();
