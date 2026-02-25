-- Add Partial Index for Customer.stripePriceId Analytics
-- Migration: 20260222_add_customer_price_id_index

-- Purpose: Optimize query performance for subscription price analytics and plan distribution
-- Impact: Faster queries for price-based filtering, subscription analytics, and admin dashboard

-- Partial Index: Customer.stripePriceId WHERE IS NOT NULL
-- Optimizes queries: WHERE "stripePriceId" = ? (only for customers with a price)
-- Used by: Subscription analytics, plan distribution reports, admin dashboard price counts
CREATE INDEX IF NOT EXISTS "Customer_stripePriceId_idx"
ON "Customer" ("stripePriceId")
WHERE "stripePriceId" IS NOT NULL;

-- Notes:
-- 1. The stripePriceId column stores the Stripe price ID (format: price_*)
-- 2. NULL values indicate customers without a paid subscription (FREE tier)
-- 3. Partial index excludes NULL values, reducing index size significantly
-- 4. Common query patterns include:
--    - Counting customers per price ID for analytics
--    - Finding all customers on a specific pricing tier
--    - Admin dashboard plan distribution by price
--
-- Performance Benefits:
-- - Price-based customer filtering: O(log n) instead of O(n) table scan
-- - Admin dashboard price counts: Faster aggregation queries
-- - Subscription analytics: Efficient price-based grouping
-- - Reduced index size: Only indexes non-NULL values
--
-- Index Strategy:
-- - Uses IF NOT EXISTS for idempotency
-- - Partial index (WHERE stripePriceId IS NOT NULL) for efficiency
-- - Low write overhead (price changes are infrequent)
-- - Complements existing plan index for comprehensive analytics
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "Customer_stripePriceId_idx";
