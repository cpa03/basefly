-- Add Database Triggers for Automated Maintenance
-- Migration: 20260131_add_automated_triggers

-- Purpose: Automate common data maintenance tasks using database triggers
-- Impact: Reduces application code complexity, ensures data consistency

-- Trigger 1: Automatically update updatedAt timestamp on K8sClusterConfig updates
CREATE OR REPLACE FUNCTION update_k8sclusterconfig_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_k8sclusterconfig_updated_at
BEFORE UPDATE ON "K8sClusterConfig"
FOR EACH ROW
EXECUTE FUNCTION update_k8sclusterconfig_updated_at();

-- Trigger 2: Automatically update updatedAt timestamp on Customer updates
CREATE OR REPLACE FUNCTION update_customer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_updated_at
BEFORE UPDATE ON "Customer"
FOR EACH ROW
EXECUTE FUNCTION update_customer_updated_at();

-- Trigger 3: Soft delete related K8s clusters when User is soft deleted
-- This ensures audit trail consistency when users are deleted for compliance
CREATE OR REPLACE FUNCTION soft_delete_user_clusters()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email LIKE 'deleted_%@example.com' THEN
    UPDATE "K8sClusterConfig"
    SET "deletedAt" = CURRENT_TIMESTAMP
    WHERE "authUserId" = NEW.id
      AND "deletedAt" IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete_user_clusters
AFTER UPDATE OF email ON "User"
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION soft_delete_user_clusters();

-- Notes:
-- 1. updatedAt triggers ensure timestamps are always accurate
-- 2. No need to manually set updatedAt in application code
-- 3. User soft delete trigger maintains data consistency
-- 4. Trigger fires when email is anonymized (deleted_@example.com pattern)
-- 5. Triggers execute within the same transaction as the update operation
--
-- Benefits:
-- - Reduces application code complexity (no manual updatedAt management)
-- - Guarantees data consistency (triggers always execute)
-- - Prevents human error (timestamps never forgotten)
-- - Improves audit trail accuracy (timestamps always reflect last update)
--
-- Performance Considerations:
-- - Minimal overhead (simple timestamp assignment)
-- - Triggers execute in same transaction (no additional round trips)
-- - Only fires on UPDATE operations (no impact on SELECT)
--
-- Rollback Strategy:
-- DROP TRIGGER IF EXISTS "trigger_name" ON "TableName";
-- DROP FUNCTION IF EXISTS "function_name"();
