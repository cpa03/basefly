/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { k8sRouter } from "./k8s";
import { TRPCError } from "@trpc/server";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    insertInto: vi.fn(),
    updateTable: vi.fn(),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
  k8sClusterService: {
    findAllActive: vi.fn(),
    softDelete: vi.fn(),
    findActive: vi.fn(),
  },
}));

vi.mock("../errors", () => ({
  createApiError: vi.fn((code, message) => {
    const error = new Error(message);
    (error as any).code = code;
    return error;
  }),
  ErrorCode: {
    NOT_FOUND: "NOT_FOUND",
    FORBIDDEN: "FORBIDDEN",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
  },
}));

describe("k8sRouter", () => {
  let mockCaller: ReturnType<typeof k8sRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const { db, k8sClusterService } = require("@saasfly/db");

    mockCaller = k8sRouter.createCaller({
      userId: "test-user-id",
      requestId: "test-request-id",
    } as any);
  });

  describe("getClusters", () => {
    it("returns all active clusters for user", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      const mockClusters = [
        {
          id: 1,
          name: "test-cluster-1",
          location: "us-east-1",
          plan: "FREE",
          status: "RUNNING",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 2,
          name: "test-cluster-2",
          location: "us-west-2",
          plan: "PRO",
          status: "RUNNING",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      k8sClusterService.findAllActive.mockResolvedValue(mockClusters);

      const result = await mockCaller.getClusters();

      expect(k8sClusterService.findAllActive).toHaveBeenCalledWith("test-user-id");
      expect(result).toEqual(mockClusters);
    });

    it("returns empty array when no clusters exist", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      k8sClusterService.findAllActive.mockResolvedValue([]);

      const result = await mockCaller.getClusters();

      expect(result).toEqual([]);
    });
  });

  describe("createCluster", () => {
    let mockInsertValues: ReturnType<typeof vi.fn>;
    let mockInsertReturning: ReturnType<typeof vi.fn>;
    let mockInsertExecute: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const { db } = require("@saasfly/db");

      mockInsertValues = vi.fn().mockReturnThis();
      mockInsertReturning = vi.fn().mockReturnThis();
      mockInsertExecute = vi.fn().mockResolvedValue({ id: 123 });

      vi.mocked(db.insertInto).mockReturnValue({
        values: mockInsertValues,
        returning: mockInsertReturning,
        executeTakeFirst: mockInsertExecute,
      } as any);
    });

    it("creates cluster with FREE plan and default network", async () => {
      const { db, SubscriptionPlan } = require("@saasfly/db");

      const input = {
        name: "my-cluster",
        location: "us-east-1",
      };

      const result = await mockCaller.createCluster(input);

      expect(db.insertInto).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockInsertValues).toHaveBeenCalledWith({
        name: "my-cluster",
        location: "us-east-1",
        network: "Default",
        plan: SubscriptionPlan.FREE,
        authUserId: "test-user-id",
      });
      expect(result).toEqual({
        id: 123,
        clusterName: "my-cluster",
        location: "us-east-1",
        success: true,
      });
    });

    it("throws error when database insert fails", async () => {
      mockInsertExecute.mockResolvedValue(null);

      const input = {
        name: "my-cluster",
        location: "us-east-1",
      };

      await expect(mockCaller.createCluster(input)).rejects.toThrow(
        "Failed to create the cluster"
      );
    });

    it("handles database errors gracefully", async () => {
      mockInsertExecute.mockRejectedValue(new Error("Database connection failed"));

      const input = {
        name: "my-cluster",
        location: "us-east-1",
      };

      await expect(mockCaller.createCluster(input)).rejects.toThrow(
        "Failed to create cluster"
      );
    });

    it("validates input with Zod schema", async () => {
      const { createApiError, ErrorCode } = require("../errors");

      const invalidInput = {
        name: "",
        location: "",
      };

      await expect(mockCaller.createCluster(invalidInput)).rejects.toThrow();
    });
  });

  describe("updateCluster", () => {
    beforeEach(() => {
      const { k8sClusterService } = require("@saasfly/db");
      const { db } = require("@saasfly/db");

      k8sClusterService.findActive.mockResolvedValue({
        id: 1,
        name: "old-name",
        location: "old-location",
        authUserId: "test-user-id",
      });

      const mockUpdateWhere = vi.fn().mockReturnThis();
      const mockUpdateSet = vi.fn().mockReturnThis();
      const mockUpdateExecute = vi.fn().mockResolvedValue(undefined);

      vi.mocked(db.updateTable).mockReturnValue({
        where: mockUpdateWhere,
        set: mockUpdateSet,
        execute: mockUpdateExecute,
      } as any);
    });

    it("updates cluster name and location", async () => {
      const { db } = require("@saasfly/db");

      const input = {
        id: 1,
        name: "new-name",
        location: "new-location",
      };

      const result = await mockCaller.updateCluster(input);

      expect(db.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(result).toEqual({ success: true });
    });

    it("updates only name when location not provided", async () => {
      const { db } = require("@saasfly/db");

      const input = {
        id: 1,
        name: "new-name",
        location: "",
      };

      await mockCaller.updateCluster(input);

      expect(db.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
    });

    it("throws NOT_FOUND error when cluster does not exist", async () => {
      const { k8sClusterService } = require("@saasfly/db");
      const { createApiError, ErrorCode } = require("../errors");

      k8sClusterService.findActive.mockResolvedValue(null);

      const input = {
        id: 999,
        name: "new-name",
        location: "new-location",
      };

      await expect(mockCaller.updateCluster(input)).rejects.toThrow(
        "Cluster not found"
      );
    });

    it("throws FORBIDDEN error when user does not own cluster", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      k8sClusterService.findActive.mockResolvedValue({
        id: 1,
        name: "cluster",
        location: "us-east-1",
        authUserId: "other-user-id",
      });

      const input = {
        id: 1,
        name: "new-name",
        location: "new-location",
      };

      await expect(mockCaller.updateCluster(input)).rejects.toThrow(
        "You don't have access to this cluster"
      );
    });
  });

  describe("deleteCluster", () => {
    beforeEach(() => {
      const { k8sClusterService } = require("@saasfly/db");

      k8sClusterService.findActive.mockResolvedValue({
        id: 1,
        name: "test-cluster",
        location: "us-east-1",
        authUserId: "test-user-id",
      });

      k8sClusterService.softDelete.mockResolvedValue(undefined);
    });

    it("soft deletes cluster when user is owner", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      const input = { id: 1 };

      const result = await mockCaller.deleteCluster(input);

      expect(k8sClusterService.findActive).toHaveBeenCalledWith(1, "test-user-id");
      expect(k8sClusterService.softDelete).toHaveBeenCalledWith(1, "test-user-id");
      expect(result).toEqual({ success: true });
    });

    it("throws NOT_FOUND error when cluster does not exist", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      k8sClusterService.findActive.mockResolvedValue(null);

      const input = { id: 999 };

      await expect(mockCaller.deleteCluster(input)).rejects.toThrow(
        "Cluster not found"
      );
    });

    it("throws FORBIDDEN error when user does not own cluster", async () => {
      const { k8sClusterService } = require("@saasfly/db");

      k8sClusterService.findActive.mockResolvedValue({
        id: 1,
        name: "cluster",
        location: "us-east-1",
        authUserId: "other-user-id",
      });

      const input = { id: 1 };

      await expect(mockCaller.deleteCluster(input)).rejects.toThrow(
        "You don't have access to this cluster"
      );
    });
  });
});
