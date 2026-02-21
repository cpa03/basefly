-- Rollback: Remove Index on K8sClusterConfig.createdAt
-- Migration: 20260221_add_cluster_createdat_index

DROP INDEX IF EXISTS "K8sClusterConfig_createdAt_idx";
