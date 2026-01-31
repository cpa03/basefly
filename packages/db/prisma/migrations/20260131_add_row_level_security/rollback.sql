-- Rollback: Remove Row-Level Security Policies
-- Migration: 20260131_add_row_level_security

-- Disable RLS on all tables and remove all policies

-- K8sClusterConfig table
DROP POLICY IF EXISTS "k8s_clusters_select_own" ON "K8sClusterConfig";
DROP POLICY IF EXISTS "k8s_clusters_insert_own" ON "K8sClusterConfig";
DROP POLICY IF EXISTS "k8s_clusters_update_own" ON "K8sClusterConfig";
DROP POLICY IF EXISTS "k8s_clusters_delete_own" ON "K8sClusterConfig";
ALTER TABLE "K8sClusterConfig" DISABLE ROW LEVEL SECURITY;

-- Customer table
DROP POLICY IF EXISTS "customers_select_own" ON "Customer";
DROP POLICY IF EXISTS "customers_insert_own" ON "Customer";
DROP POLICY IF EXISTS "customers_update_own" ON "Customer";
ALTER TABLE "Customer" DISABLE ROW LEVEL SECURITY;

-- User table
DROP POLICY IF EXISTS "users_select_own" ON "User";
DROP POLICY IF EXISTS "users_update_own" ON "User";
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Notes:
-- 1. IF EXISTS ensures safe rollback even if policies were already removed
-- 2. Disabling RLS removes all tenant isolation at database level
-- 3. Application must handle all data access control after rollback
-- 4. Existing data is not affected by removing RLS policies
