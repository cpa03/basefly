-- Add Check Constraints for Data Integrity
-- Migration: 20260131_add_check_constraints

-- Purpose: Enforce business rules and data validation at database level
-- Impact: Prevents invalid data from being inserted or updated

-- Check Constraint 1: K8sClusterConfig name must not be empty
-- Ensures cluster names are always meaningful
ALTER TABLE "K8sClusterConfig"
ADD CONSTRAINT "K8sClusterConfig_name_not_empty"
CHECK (LENGTH(TRIM("name")) > 0);

-- Check Constraint 2: K8sClusterConfig name max length
-- Prevents excessively long names
ALTER TABLE "K8sClusterConfig"
ADD CONSTRAINT "K8sClusterConfig_name_max_length"
CHECK (LENGTH("name") <= 100);

-- Check Constraint 3: K8sClusterConfig location must not be empty
-- Ensures cluster locations are always meaningful
ALTER TABLE "K8sClusterConfig"
ADD CONSTRAINT "K8sClusterConfig_location_not_empty"
CHECK (LENGTH(TRIM("location")) > 0);

-- Check Constraint 4: K8sClusterConfig location max length
-- Prevents excessively long locations
ALTER TABLE "K8sClusterConfig"
ADD CONSTRAINT "K8sClusterConfig_location_max_length"
CHECK (LENGTH("location") <= 50);

-- Check Constraint 5: Customer stripeCustomerId format
-- Ensures Stripe customer IDs follow correct format if provided
ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_stripeCustomerId_format"
CHECK ("stripeCustomerId" IS NULL OR "stripeCustomerId" LIKE 'cus_%');

-- Check Constraint 6: Customer stripeSubscriptionId format
-- Ensures Stripe subscription IDs follow correct format if provided
ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_stripeSubscriptionId_format"
CHECK ("stripeSubscriptionId" IS NULL OR "stripeSubscriptionId" LIKE 'sub_%');

-- Notes:
-- 1. Check constraints enforce business rules at database level
-- 2. These constraints complement application-level validation
-- 3. NULL is allowed for Stripe IDs (user may not be subscribed yet)
-- 4. Constraints are checked on INSERT and UPDATE
-- 5. Failing a constraint operation throws a database error
--
-- Data Validation Benefits:
-- - Prevents empty names/locations from entering database
-- - Enforces reasonable length limits for text fields
-- - Validates Stripe ID formats before database insertion
-- - Provides last line of defense against invalid data
--
-- Performance Considerations:
-- - Check constraints add minimal overhead to INSERT/UPDATE
-- - No impact on SELECT queries
-- - Constraints are evaluated in-memory
--
-- Rollback Strategy:
-- DROP CONSTRAINT IF EXISTS "constraint_name" ON "TableName";
