import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { K8S_DEFAULTS } from "@saasfly/common";
import { db, k8sClusterService } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

export const k8sClusterCreateSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  location: z.string().min(1),
});

export const k8sClusterDeleteSchema = z.object({
  id: z.number().positive().int(),
});

async function verifyClusterOwnership(clusterId: number, userId: string) {
  const cluster = await k8sClusterService.findActive(clusterId, userId);
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
  getClusters: createRateLimitedProtectedProcedure("read").query(
    async (opts) => {
      const userId = opts.ctx.userId! as string;
      return await k8sClusterService.findAllActive(userId);
    },
  ),
  createCluster: createRateLimitedProtectedProcedure("write")
    .input(k8sClusterCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId! as string;

      try {
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
            error.errors,
          );
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to create cluster",
          error,
        );
      }
    }),
  updateCluster: createRateLimitedProtectedProcedure("write")
    .input(k8sClusterCreateSchema)
    .mutation(async (opts) => {
      const id = opts.input.id!;
      const userId = opts.ctx.userId!;
      const newName = opts.input.name;
      const newLocation = opts.input.location;

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
      }
      return {
        success: true,
      };
    }),
  deleteCluster: createRateLimitedProtectedProcedure("write")
    .input(k8sClusterDeleteSchema)
    .mutation(async (opts) => {
      const id = opts.input.id;
      const userId = opts.ctx.userId!;

      await verifyClusterOwnership(id, userId);

      await k8sClusterService.softDelete(id, userId);
      return { success: true };
    }),
});
