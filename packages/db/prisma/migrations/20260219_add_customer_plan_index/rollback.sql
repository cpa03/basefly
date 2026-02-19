-- Rollback: Remove Customer.plan Index
-- Migration: 20260219_add_customer_plan_index

DROP INDEX IF EXISTS "Customer_plan_idx";
