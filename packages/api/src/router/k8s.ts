import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { CLUSTER_VALIDATION, K8S_DEFAULTS } from "@saasfly/common";
import { db, k8sClusterService } from "@saasfly/db";
import type { K8sClusterConfig } from "@saasfly/db";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

import type { TRPCContext } from "../trpc";

function requireUserId(ctx: TRPCContext): string {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return ctx.userId;
}

// Enhanced schemas with comprehensive validation using centralized constants
export const k8sClusterCreateSchema = z
  .object({
    id: z.number().int().positive().optional(),
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        `Cluster name cannot exceed ${CLUSTER_VALIDATION.name.maxLength} characters`,
      )
      .regex(
        CLUSTER_VALIDATION.name.pattern,
        CLUSTER_VALIDATION.name.patternMessage,
      ),
    location: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.location.minLength, "Location cannot be empty")
      .max(
        CLUSTER_VALIDATION.location.maxLength,
        `Location cannot exceed ${CLUSTER_VALIDATION.location.maxLength} characters`,
      ),
  })
  .strict();

export const k8sClusterDeleteSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
  })
  .strict();

export const k8sClusterUpdateSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        `Cluster name cannot exceed ${CLUSTER_VALIDATION.name.maxLength} characters`,
      )
      .regex(
        CLUSTER_VALIDATION.name.pattern,
        CLUSTER_VALIDATION.name.patternMessage,
      )
      .optional(),
    location: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.location.minLength, "Location cannot be empty")
      .max(
        CLUSTER_VALIDATION.location.maxLength,
        `Location cannot exceed ${CLUSTER_VALIDATION.location.maxLength} characters`,
      )
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.location !== undefined,
    "At least one field (name or location) must be provided for update",
  );

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
async function verifyClusterOwnership(
  clusterId: number,
  userId: string,
): Promise<K8sClusterConfig> {
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
      const userId = requireUserId(opts.ctx);
      return await k8sClusterService.findAllActive(userId);
    },
  ),
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  createCluster: createRateLimitedProtectedProcedure("write")

    .input(k8sClusterCreateSchema)
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
  updateCluster: createRateLimitedProtectedProcedure("write")
    .input(k8sClusterUpdateSchema)
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
  deleteCluster: createRateLimitedProtectedProcedure("write")
    .input(k8sClusterDeleteSchema)
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
