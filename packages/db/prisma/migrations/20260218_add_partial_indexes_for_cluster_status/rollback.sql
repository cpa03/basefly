-- Rollback: Remove Partial Indexes for K8sClusterConfig
-- Migration: 20260218_add_partial_indexes_for_cluster_status

DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_active_idx";
DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_deleted_idx";
DROP INDEX IF EXISTS "K8sClusterConfig_status_active_idx";
