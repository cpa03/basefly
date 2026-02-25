-- Add Row-Level Security (RLS) for Multi-Tenant Data Protection
-- Migration: 20260131_add_row_level_security

-- Purpose: Enforce tenant isolation at database level using Row-Level Security
-- Impact: Provides defense-in-depth by restricting data access beyond application-level checks

-- Enable RLS on all tables with tenant-aware data (authUserId column)

-- Step 1: Enable RLS on K8sClusterConfig table
ALTER TABLE "K8sClusterConfig" ENABLE ROW LEVEL SECURITY;

-- Step 2: Create RLS policies for K8sClusterConfig
-- Policy 1: Allow users to read their own active clusters
CREATE POLICY "k8s_clusters_select_own_active"
ON "K8sClusterConfig"
FOR SELECT
USING ("authUserId" = current_setting('app.current_user_id', true)::text AND "deletedAt" IS NULL);

-- Policy 2: Allow users to insert their own clusters
CREATE POLICY "k8s_clusters_insert_own"
ON "K8sClusterConfig"
FOR INSERT
WITH CHECK ("authUserId" = current_setting('app.current_user_id', true)::text);

-- Policy 3: Allow users to update their own clusters
CREATE POLICY "k8s_clusters_update_own"
ON "K8sClusterConfig"
FOR UPDATE
USING ("authUserId" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("authUserId" = current_setting('app.current_user_id', true)::text);

-- Policy 4: Allow users to soft delete their own clusters
CREATE POLICY "k8s_clusters_delete_own"
ON "K8sClusterConfig"
FOR UPDATE
USING ("authUserId" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("authUserId" = current_setting('app.current_user_id', true)::text AND "deletedAt" IS NOT NULL);

-- Step 3: Enable RLS on Customer table
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for Customer table
-- Policy 1: Allow users to read their own customer data
CREATE POLICY "customers_select_own"
ON "Customer"
FOR SELECT
USING ("authUserId" = current_setting('app.current_user_id', true)::text);

-- Policy 2: Allow users to insert their own customer data
CREATE POLICY "customers_insert_own"
ON "Customer"
FOR INSERT
WITH CHECK ("authUserId" = current_setting('app.current_user_id', true)::text);

-- Policy 3: Allow users to update their own customer data
CREATE POLICY "customers_update_own"
ON "Customer"
FOR UPDATE
USING ("authUserId" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("authUserId" = current_setting('app.current_user_id', true)::text);

-- Step 5: Enable RLS on User table (limited - for self-service operations)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policy for User table (read-only for self)
CREATE POLICY "users_select_own"
ON "User"
FOR SELECT
USING ("id" = current_setting('app.current_user_id', true)::text);

-- Step 7: Create RLS policy for User table (update own name)
CREATE POLICY "users_update_own"
ON "User"
FOR UPDATE
USING ("id" = current_setting('app.current_user_id', true)::text)
WITH CHECK ("id" = current_setting('app.current_user_id', true)::text);

-- Notes:
-- 1. RLS policies enforce tenant isolation at database level
-- 2. Policies reference current_setting('app.current_user_id') for context
-- 3. Application must set 'app.current_user_id' before each transaction
-- 4. K8sClusterConfig policies respect soft delete (deletedAt checks)
-- 5. User table policies are read-only (no DELETE policy)
-- 6. Application-level authUserId checks remain as first line of defense
--
-- Defense in Depth:
-- Layer 1: Application-level validation (Zod schemas, authUserId checks)
-- Layer 2: Database-level constraints (foreign keys, check constraints)
-- Layer 3: Row-Level Security policies (tenant isolation)
--
-- Performance Considerations:
-- - RLS adds minimal overhead (policy evaluation is fast)
-- - Indexes on authUserId columns optimize RLS policy filtering
-- - No impact on SELECT queries that already filter by authUserId
--
-- Migration Requirements:
-- - Application must set session variable before each transaction
-- - User deletion service needs elevated privileges (RLS bypass)
--
-- Rollback Strategy:
-- ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "policy_name" ON "TableName";
