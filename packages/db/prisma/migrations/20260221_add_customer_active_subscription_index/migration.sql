-- Migration: 20260221_add_customer_active_subscription_index
-- Description: Add partial index on Customer.stripeSubscriptionId for active subscription queries
-- Purpose: Optimize admin dashboard query that counts active subscriptions (IS NOT NULL filter)
-- Note: While stripeSubscriptionId has a unique constraint (which creates an index),
--       PostgreSQL unique indexes on nullable columns don't efficiently support IS NOT NULL
--       queries because NULLs are not indexed. This partial index only includes rows with
--       actual subscription IDs, making COUNT queries with "WHERE stripeSubscriptionId IS NOT NULL"
--       significantly faster for large customer bases.

-- Create partial index for active subscription queries
CREATE INDEX "Customer_stripeSubscriptionId_active_idx" ON "Customer"("stripeSubscriptionId") 
WHERE "stripeSubscriptionId" IS NOT NULL;
