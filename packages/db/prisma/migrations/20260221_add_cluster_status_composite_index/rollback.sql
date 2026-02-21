-- Rollback: Remove Composite Partial Index for K8sClusterConfig
-- Migration: 20260221_add_cluster_status_composite_index

DROP INDEX IF EXISTS "K8sClusterConfig_authUserId_status_active_idx";
