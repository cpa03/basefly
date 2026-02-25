-- Add Unique Constraint on Customer.authUserId
-- Migration: 20260220_add_customer_authuserid_unique_constraint

-- Purpose: Enforce one-customer-per-user business rule at database level
-- Impact: Prevents duplicate Customer records for the same user, ensuring data integrity

-- Unique Constraint: authUserId
-- Enforces: Each user can only have one Customer record
-- Used by: Customer creation, subscription management, billing flows

-- Before adding constraint, ensure no duplicates exist
-- This query identifies any potential duplicates (should return 0 rows in production)
-- SELECT "authUserId", COUNT(*) as count FROM "Customer" GROUP BY "authUserId" HAVING COUNT(*) > 1;

-- Add unique constraint
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_authUserId_unique" UNIQUE ("authUserId");

-- Notes:
-- 1. This constraint enforces the 1:1 relationship between User and Customer at DB level
-- 2. The application layer already has logic to prevent duplicates, but this provides
--    a fail-safe at the database level for data integrity
-- 3. The existing index on authUserId (@@index([authUserId])) will be used by this constraint
-- 4. Prisma schema has @unique on stripeCustomerId and stripeSubscriptionId, but not authUserId
--    This was an oversight that this migration corrects
--
-- Benefits:
-- - Prevents race conditions in customer creation
-- - Enforces business rule at database level (defense in depth)
-- - Provides clear error message for duplicate attempts
-- - Reduces need for application-level duplicate checks
--
-- Error Handling:
-- - PostgreSQL error code: 23505 (unique_violation)
-- - Application should catch this and return appropriate error message
--
-- Performance Considerations:
-- - Uses existing index, no additional index creation needed
-- - Minimal write overhead (constraint check uses existing index)
-- - No impact on read queries
--
-- Rollback Strategy:
-- ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_authUserId_unique";
