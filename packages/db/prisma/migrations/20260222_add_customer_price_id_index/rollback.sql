-- Rollback: Remove Partial Index for Customer.stripePriceId
-- Migration: 20260222_add_customer_price_id_index

DROP INDEX IF EXISTS "Customer_stripePriceId_idx";
