-- Rollback: Remove Database Triggers
-- Migration: 20260131_add_automated_triggers

-- Remove all triggers and functions added in the migration

DROP TRIGGER IF EXISTS trigger_update_k8sclusterconfig_updated_at ON "K8sClusterConfig";
DROP FUNCTION IF EXISTS update_k8sclusterconfig_updated_at();

DROP TRIGGER IF EXISTS trigger_update_customer_updated_at ON "Customer";
DROP FUNCTION IF EXISTS update_customer_updated_at();

DROP TRIGGER IF EXISTS trigger_soft_delete_user_clusters ON "User";
DROP FUNCTION IF EXISTS soft_delete_user_clusters();

-- Notes:
-- 1. IF EXISTS ensures safe rollback even if triggers were already removed
-- 2. Removing functions triggers requires dropping triggers first (dependency order)
-- 3. Application must handle updatedAt timestamps manually after rollback
-- 4. UserDeletionService must handle cluster soft delete after rollback
