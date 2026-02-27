-- Rollback: Remove Unique Constraint on Customer.authUserId
-- Migration: 20260220_add_customer_authuserid_unique_constraint

-- Remove the unique constraint
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_authUserId_unique";
