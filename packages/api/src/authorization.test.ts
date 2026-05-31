/**
 * Authorization Utilities Tests
 *
 * Tests for verifyOwnership, verifyOwnershipWithFetch, and createOwnershipVerifier
 * to ensure proper authorization enforcement in tRPC procedures.
 *
 * @module authorization.test
 */

import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

import {
  createOwnershipVerifier,
  verifyOwnership,
  verifyOwnershipWithFetch,
} from "./authorization";
import { createAnonymousContext, createMockContext } from "./test-utils";

interface TestCluster {
  id: number;
  name: string;
  authUserId: string | null;
}

describe("Authorization Utilities", () => {
  describe("verifyOwnership", () => {
    const userId = "user-123";
    const otherUserId = "user-456";

    it("should allow access when user owns the resource", () => {
      const ctx = createMockContext({ userId });

      // Should not throw
      expect(() => verifyOwnership(ctx, userId, "test-resource")).not.toThrow();
    });

    it("should throw UNAUTHORIZED when user is not authenticated", () => {
      const ctx = createAnonymousContext();

      expect(() => verifyOwnership(ctx, userId, "test-resource")).toThrow(
        TRPCError,
      );
      expect(() => verifyOwnership(ctx, userId, "test-resource")).toThrow(
        /authentication required/i,
      );
    });

    it("should throw FORBIDDEN when user does not own the resource", () => {
      const ctx = createMockContext({ userId });

      expect(() => verifyOwnership(ctx, otherUserId, "test-resource")).toThrow(
        TRPCError,
      );
      expect(() => verifyOwnership(ctx, otherUserId, "test-resource")).toThrow(
        /don't have access/i,
      );
    });

    it("should include resource type in error message", () => {
      const ctx = createMockContext({ userId });

      expect(() => verifyOwnership(ctx, otherUserId, "cluster")).toThrow(
        /cluster/i,
      );
    });

    it("should include resourceId in context when provided", () => {
      const ctx = createMockContext({ userId, requestId: "req-123" });

      // Should not throw - we just verify it accepts resourceId
      expect(() => verifyOwnership(ctx, userId, "cluster", 1)).not.toThrow();
    });
  });

  describe("verifyOwnershipWithFetch", () => {
    const userId = "user-123";
    const otherUserId = "user-456";

    it("should return resource when user owns it", async () => {
      const ctx = createMockContext({ userId });
      const resource = { id: 1, ownerId: userId };

      const result = await verifyOwnershipWithFetch(
        ctx,
        () => Promise.resolve(resource),
        "test-resource",
        "Resource not found",
      );

      expect(result).toEqual(resource);
    });

    it("should throw UNAUTHORIZED when user is not authenticated", async () => {
      const ctx = createAnonymousContext();

      await expect(
        verifyOwnershipWithFetch(
          ctx,
          () => Promise.resolve({ id: 1, ownerId: userId }),
          "test-resource",
          "Resource not found",
        ),
      ).rejects.toThrow(TRPCError);
    });

    it("should throw NOT_FOUND when resource does not exist", async () => {
      const ctx = createMockContext({ userId });

      await expect(
        verifyOwnershipWithFetch(
          ctx,
          () => Promise.resolve(undefined),
          "test-resource",
          "Resource not found",
        ),
      ).rejects.toThrow(/not found/i);
    });

    it("should throw FORBIDDEN when user does not own the resource", async () => {
      const ctx = createMockContext({ userId });
      const resource = { id: 1, ownerId: otherUserId };

      await expect(
        verifyOwnershipWithFetch(
          ctx,
          () => Promise.resolve(resource),
          "test-resource",
          "Resource not found",
        ),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("createOwnershipVerifier", () => {
    const userId = "user-123";
    const otherUserId = "user-456";

    it("should return resource when user owns it", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createMockContext({ userId });
      const cluster = { id: 1, name: "test", authUserId: userId };

      const result = await verifyClusterOwnership(ctx, cluster);
      expect(result).toEqual(cluster);
    });

    it("should throw UNAUTHORIZED when user is not authenticated", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createAnonymousContext();
      const cluster = { id: 1, name: "test", authUserId: userId };

      await expect(verifyClusterOwnership(ctx, cluster)).rejects.toThrow(
        TRPCError,
      );
    });

    it("should throw NOT_FOUND when resource is null", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createMockContext({ userId });

      await expect(verifyClusterOwnership(ctx, null)).rejects.toThrow(
        /not found/i,
      );
    });

    it("should throw NOT_FOUND when resource is undefined", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createMockContext({ userId });

      await expect(verifyClusterOwnership(ctx, undefined)).rejects.toThrow(
        /not found/i,
      );
    });

    it("should throw FORBIDDEN when user does not own the resource", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createMockContext({ userId });
      const cluster = { id: 1, name: "test", authUserId: otherUserId };

      await expect(verifyClusterOwnership(ctx, cluster)).rejects.toThrow(
        TRPCError,
      );
    });

    it("should throw FORBIDDEN when resource has null ownerId", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        (cluster: TestCluster) => cluster.authUserId,
      );

      const ctx = createMockContext({ userId });
      const cluster = { id: 1, name: "test", authUserId: null };

      await expect(verifyClusterOwnership(ctx, cluster)).rejects.toThrow(
        TRPCError,
      );
    });

    it("should work with async getOwnerId functions", async () => {
      const verifyClusterOwnership = createOwnershipVerifier(
        "cluster",
        async (cluster: TestCluster) => {
          // Simulate async lookup
          await Promise.resolve();
          return cluster.authUserId;
        },
      );

      const ctx = createMockContext({ userId });
      const cluster = { id: 1, name: "test", authUserId: userId };

      const result = await verifyClusterOwnership(ctx, cluster);
      expect(result).toEqual(cluster);
    });
  });
});
