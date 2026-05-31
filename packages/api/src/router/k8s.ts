/**
 * Kubernetes Cluster Management Router
 *
 * Provides CRUD operations for Kubernetes cluster configurations.
 * All endpoints are rate-limited and require authentication.
 *
 * @module k8sRouter
 * @see {@link https://docs.saasfly.io/api/k8s | K8s API Documentation}
 */

import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { K8S_DEFAULTS } from "@saasfly/common";
import { db, k8sClusterService, type K8sClusterConfig } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import {
  createRateLimitedProtectedProcedure,
  createTRPCRouter,
  type TRPCContext,
} from "../trpc";
import {
  enhancedK8sClusterCreateSchema,
  enhancedK8sClusterDeleteSchema,
  enhancedK8sClusterUpdateSchema,
} from "./schemas";

function requireUserId(ctx: TRPCContext): string {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return ctx.userId;
}

// Helper function to verify cluster ownership
async function verifyClusterOwnership(
  clusterId: number,
  userId: string,
): Promise<K8sClusterConfig> {
  const cluster: K8sClusterConfig | undefined =
    await k8sClusterService.findActive(clusterId, userId);
  if (!cluster) {
    throw createApiError(ErrorCode.NOT_FOUND, "Cluster not found");
  }
  if (cluster.authUserId && cluster.authUserId !== userId) {
    throw createApiError(
      ErrorCode.FORBIDDEN,
      "You don't have access to this cluster",
    );
  }
  return cluster;
}

export const k8sRouter = createTRPCRouter({
  /**
   * Retrieves all active Kubernetes clusters for the authenticated user.
   *
   * @returns Array of active cluster configurations
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   */
  getClusters: createRateLimitedProtectedProcedure("read").query(
    async (opts) => {
      const userId = requireUserId(opts.ctx);
      return await k8sClusterService.findAllActive(userId);
    },
  ),
  /**
   * Creates a new Kubernetes cluster for the authenticated user.
   *
   * @param input - Cluster configuration (name, location)
   * @returns The created cluster with ID, name, and location
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} BAD_REQUEST if validation fails
   */
  createCluster: createRateLimitedProtectedProcedure("write")
    .input(enhancedK8sClusterCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = requireUserId(ctx);
      const requestId = ctx.requestId;

      try {
        logger.info(
          {
            userId,
            requestId,
            clusterName: input.name,
            location: input.location,
          },
          "Creating cluster",
        );

        const newCluster = await db
          .insertInto("K8sClusterConfig")
          .values({
            name: input.name,
            location: input.location,
            network: K8S_DEFAULTS.network,
            plan: K8S_DEFAULTS.plan,
            authUserId: userId,
          })
          .returning("id")
          .executeTakeFirst();

        if (!newCluster) {
          throw createApiError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            "Failed to create the cluster",
          );
        }

        logger.info(
          { userId, requestId, clusterId: newCluster.id },
          "Cluster created successfully",
        );

        // ISR: Invalidate dashboard cache after cluster creation
        revalidatePath("/[lang]/dashboard");
        return {
          id: newCluster.id,
          clusterName: input.name,
          location: input.location,
          success: true,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createApiError(
            ErrorCode.VALIDATION_ERROR,
            "Invalid input data",
            error.issues,
          );
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to create cluster",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to create cluster",
          error,
        );
      }
    }),
  /**
   * Updates an existing Kubernetes cluster's configuration.
   *
   * @param input - Cluster update (id, optional name, optional location)
   * @returns Success status
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} NOT_FOUND if cluster not found
   * @throws {TRPCError} FORBIDDEN if user doesn't own the cluster
   * @throws {TRPCError} BAD_REQUEST if validation fails
   */
  updateCluster: createRateLimitedProtectedProcedure("write")
    .input(enhancedK8sClusterUpdateSchema)
    .mutation(async (opts) => {
      const id = opts.input.id;
      const userId = requireUserId(opts.ctx);
      const newName = opts.input.name;
      const newLocation = opts.input.location;
      const requestId = opts.ctx.requestId;

      try {
        logger.info({ userId, requestId, clusterId: id }, "Updating cluster");

        await verifyClusterOwnership(id, userId);

        if (newName || newLocation) {
          const updateData: Record<string, string> = {};
          if (newName) updateData.name = newName;
          if (newLocation) updateData.location = newLocation;

          await db
            .updateTable("K8sClusterConfig")
            .where("id", "=", id)
            .set(updateData)
            .execute();

          logger.info(
            { userId, requestId, clusterId: id },
            "Cluster updated successfully",
          );
        }

        // ISR: Invalidate dashboard cache after cluster update
        revalidatePath("/[lang]/dashboard");
        return {
          success: true,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createApiError(
            ErrorCode.VALIDATION_ERROR,
            "Invalid input data",
            error.issues,
          );
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        logger.error(
          {
            userId,
            requestId,
            clusterId: id,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to update cluster",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to update cluster",
          error,
        );
      }
    }),
  /**
   * Soft deletes a Kubernetes cluster (marks as deleted).
   *
   * @param input - Cluster ID to delete
   * @returns Success status
   * @throws {TRPCError} UNAUTHORIZED if not authenticated
   * @throws {TRPCError} NOT_FOUND if cluster not found
   * @throws {TRPCError} FORBIDDEN if user doesn't own the cluster
   * @throws {TRPCError} BAD_REQUEST if validation fails
   */
  deleteCluster: createRateLimitedProtectedProcedure("write")
    .input(enhancedK8sClusterDeleteSchema)
    .mutation(async (opts) => {
      const id = opts.input.id;
      const userId = requireUserId(opts.ctx);
      const requestId = opts.ctx.requestId;

      try {
        logger.info({ userId, requestId, clusterId: id }, "Deleting cluster");

        await verifyClusterOwnership(id, userId);

        await k8sClusterService.softDelete(id, userId);

        logger.info(
          { userId, requestId, clusterId: id },
          "Cluster deleted successfully",
        );

        // ISR: Invalidate dashboard cache after cluster deletion
        revalidatePath("/[lang]/dashboard");
        return { success: true };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createApiError(
            ErrorCode.VALIDATION_ERROR,
            "Invalid input data",
            error.issues,
          );
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        logger.error(
          {
            userId,
            requestId,
            clusterId: id,
            error: error instanceof Error ? error.message : String(error),
          },
          "Failed to delete cluster",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to delete cluster",
          error,
        );
      }
    }),
});
