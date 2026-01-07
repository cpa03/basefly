import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getCurrentUser } from "@saasfly/auth";
import { db, SubscriptionPlan, k8sClusterService } from "@saasfly/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const k8sClusterCreateSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  location: z.string(),
});

const k8sClusterDeleteSchema = z.object({
  id: z.number(),
});

export const k8sRouter = createTRPCRouter({
  getClusters: protectedProcedure.query(async (opts) => {
    const user = await getCurrentUser();
    const userId = opts.ctx.userId! as string;
    if (!user) {
      return;
    }
    return await k8sClusterService.findAllActive(userId);
  }),
  createCluster: protectedProcedure
    .input(k8sClusterCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId! as string;

      const user = await getCurrentUser();
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a cluster",
        });
      }
      try {
        const newCluster = await db
          .insertInto("K8sClusterConfig")
          .values({
            name: input.name,
            location: input.location,
            network: "Default",
            plan: SubscriptionPlan.FREE,
            authUserId: userId,
          })
          .returning("id")
          .executeTakeFirst();

        if (!newCluster) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create the cluster",
          });
        }

        return {
          id: newCluster.id,
          clusterName: input.name,
          location: input.location,
          success: true,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TRPCError({ code: "BAD_REQUEST", cause: error });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    }),
  updateCluster: protectedProcedure
    .input(k8sClusterCreateSchema)
    .mutation(async (opts) => {
      const id = opts.input.id!;
      const userId = opts.ctx.userId!;
      const newName = opts.input.name;
      const newLocation = opts.input.location;

      const cluster = await k8sClusterService.findActive(id, userId);
      if (!cluster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cluster not found",
        });
      }

      if (cluster.authUserId && cluster.authUserId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this cluster",
        });
      }
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
  deleteCluster: protectedProcedure
    .input(k8sClusterDeleteSchema)
    .mutation(async (opts) => {
      const id = opts.input.id;
      const userId = opts.ctx.userId!;
      const cluster = await k8sClusterService.findActive(id, userId);
      if (!cluster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cluster not found",
        });
      }
      if (cluster.authUserId && cluster.authUserId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this cluster",
        });
      }
      await k8sClusterService.softDelete(id, userId);
      return { success: true };
    }),
});
