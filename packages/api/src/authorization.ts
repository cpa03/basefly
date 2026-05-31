/**
 * Authorization Utilities for tRPC Procedures
 *
 * Provides reusable authorization helpers to ensure consistent
 * ownership verification across all tRPC routers.
 *
 * @module authorization
 */

import { createApiError, ErrorCode } from "./errors";
import { logger } from "./logger";

/**
 * Minimal context type for authorization functions.
 * Defined here to avoid circular dependency with trpc.ts.
 */
export interface AuthorizationContext {
  userId: string | null;
  requestId: string;
}

/**
 * Verifies that the authenticated user has access to a resource
 * owned by the specified userId.
 *
 * @param ctx - The authorization context containing userId
 * @param resourceOwnerId - The userId that owns the resource
 * @param resourceType - Type of resource for logging (e.g., "cluster", "customer")
 * @param resourceId - ID of the resource for logging
 * @throws {TRPCError} UNAUTHORIZED if user is not authenticated
 * @throws {TRPCError} FORBIDDEN if user does not own the resource
 */
export function verifyOwnership(
  ctx: AuthorizationContext,
  resourceOwnerId: string,
  resourceType: string,
  resourceId?: number | string,
): void {
  // Check authentication
  if (!ctx.userId) {
    logger.warn(
      {
        requestId: ctx.requestId,
        security: true,
        reason: "missing_user_id",
        resourceType,
        resourceId,
      },
      `Unauthorized access attempt to ${resourceType}`,
    );
    throw createApiError(ErrorCode.UNAUTHORIZED, "Authentication required");
  }

  // Check ownership
  if (ctx.userId !== resourceOwnerId) {
    logger.warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        resourceOwnerId,
        resourceType,
        resourceId,
        security: true,
        reason: "ownership_mismatch",
      },
      `Forbidden: User attempted to access ${resourceType} owned by another user`,
    );
    throw createApiError(
      ErrorCode.FORBIDDEN,
      `You don't have access to this ${resourceType}`,
    );
  }
}

/**
 * Verifies ownership with async resource lookup.
 * Use this when you need to fetch the resource first to determine ownership.
 *
 * @param ctx - The authorization context containing userId
 * @param fetchResource - Async function to fetch the resource
 * @param resourceType - Type of resource for logging
 * @param notFoundMessage - Error message if resource not found
 * @returns The resource if ownership verified
 * @throws {TRPCError} UNAUTHORIZED if user is not authenticated
 * @throws {TRPCError} FORBIDDEN if user does not own the resource
 * @throws {TRPCError} NOT_FOUND if resource doesn't exist
 */
export async function verifyOwnershipWithFetch<T extends { ownerId?: string }>(
  ctx: AuthorizationContext,
  fetchResource: () => Promise<T | undefined | null>,
  resourceType: string,
  notFoundMessage: string,
  getOwnerId?: (resource: T) => string | null | undefined,
): Promise<T> {
  // Check authentication
  if (!ctx.userId) {
    logger.warn(
      {
        requestId: ctx.requestId,
        security: true,
        reason: "missing_user_id",
        resourceType,
      },
      `Unauthorized access attempt to ${resourceType}`,
    );
    throw createApiError(ErrorCode.UNAUTHORIZED, "Authentication required");
  }

  // Fetch resource
  const resource = await fetchResource();

  if (!resource) {
    throw createApiError(ErrorCode.NOT_FOUND, notFoundMessage);
  }

  // Check ownership
  const ownerIdToCheck = getOwnerId ? getOwnerId(resource) : resource.ownerId;
  if (ownerIdToCheck && ownerIdToCheck !== ctx.userId) {
    logger.warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        ownerId: ownerIdToCheck,
        resourceType,
        security: true,
        reason: "ownership_mismatch",
      },
      `Forbidden: User attempted to access ${resourceType} owned by another user`,
    );
    throw createApiError(
      ErrorCode.FORBIDDEN,
      `You don't have access to this ${resourceType}`,
    );
  }

  return resource;
}

/**
 * Creates an ownership verification function for a specific resource type.
 * This is a factory function that returns a verify function tailored to the resource.
 *
 * @param resourceType - The type of resource (e.g., "cluster", "customer")
 * @param getOwnerId - Function to extract ownerId from resource
 * @returns Function to verify ownership of a given resource
 *
 * @example
 * ```ts
 * const verifyClusterOwnership = createOwnershipVerifier(
 *   "cluster",
 *   (cluster) =>
 * );
 *
 cluster.authUserId * // Usage in procedure
 * const cluster = await verifyClusterOwnership(ctx, clusterId, (c) => c.authUserId);
 * ```
 */
export function createOwnershipVerifier<T>(
  resourceType: string,
  getOwnerId: (
    resource: T,
  ) => string | null | undefined | Promise<string | null | undefined>,
) {
  return async function verify(
    ctx: AuthorizationContext,
    resource: T | undefined | null,
  ): Promise<T> {
    // Check authentication
    if (!ctx.userId) {
      logger.warn(
        {
          requestId: ctx.requestId,
          security: true,
          reason: "missing_user_id",
          resourceType,
        },
        `Unauthorized access attempt to ${resourceType}`,
      );
      throw createApiError(ErrorCode.UNAUTHORIZED, "Authentication required");
    }

    // Check resource exists
    if (!resource) {
      throw createApiError(ErrorCode.NOT_FOUND, `${resourceType} not found`);
    }

    // Check ownership
    const ownerId = await getOwnerId(resource);
    if (!ownerId || ownerId !== ctx.userId) {
      logger.warn(
        {
          requestId: ctx.requestId,
          userId: ctx.userId,
          ownerId,
          resourceType,
          security: true,
          reason: "ownership_mismatch",
        },
        `Forbidden: User attempted to access ${resourceType} owned by another user`,
      );
      throw createApiError(
        ErrorCode.FORBIDDEN,
        `You don't have access to this ${resourceType}`,
      );
    }

    return resource;
  };
}
