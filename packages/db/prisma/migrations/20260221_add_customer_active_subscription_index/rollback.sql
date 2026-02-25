-- Rollback: 20260221_add_customer_active_subscription_index
-- Description: Remove partial index on Customer.stripeSubscriptionId

DROP INDEX IF EXISTS "Customer_stripeSubscriptionId_active_idx";
