/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "./index";
import { SoftDeleteService } from "./soft-delete";

vi.mock("./index", () => ({
  db: {
    selectFrom: vi.fn(),
    updateTable: vi.fn(),
    deleteFrom: vi.fn(),
  },
}));

vi.mock("../prisma/types", () => ({
  DB: {},
}));

describe("SoftDeleteService", () => {
  let service: SoftDeleteService<"K8sClusterConfig">;
  let mockUpdateWhere: ReturnType<typeof vi.fn>;
  let mockUpdateSet: ReturnType<typeof vi.fn>;
  let mockUpdateExecute: ReturnType<typeof vi.fn>;
  let mockSelectAll: ReturnType<typeof vi.fn>;
  let mockSelectWhere1: any;
  let mockSelectWhere2: any;
  let mockSelectWhere3: any;
  let mockSelectExecute: ReturnType<typeof vi.fn>;
  let mockSelectExecuteTakeFirst: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateWhere = vi.fn().mockReturnThis();
    mockUpdateSet = vi.fn().mockReturnThis();
    mockUpdateExecute = vi.fn().mockResolvedValue(undefined);

    mockSelectAll = vi.fn().mockReturnThis();
    mockSelectWhere1 = vi.fn().mockReturnThis();
    mockSelectWhere2 = vi.fn().mockReturnThis();
    mockSelectWhere3 = vi.fn().mockReturnThis();
    mockSelectExecute = vi.fn().mockResolvedValue([]);
    mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

    // Create a chainable mock object for select queries
    // Each where() call returns the same object to track all calls
    let whereCallCount = 0;
    const selectChain = {
      selectAll: mockSelectAll,
      select: vi.fn().mockReturnThis(),
      where: vi.fn((...args: unknown[]) => {
        // Track each where call on separate mocks based on call order
        whereCallCount++;
        if (whereCallCount === 1) {
          // First where call is either "id" (findActive) or "authUserId" (findAllActive/findDeleted)
          mockSelectWhere1(...args);
        } else if (whereCallCount === 2) {
          // Second where call is either "authUserId" (findActive) or "deletedAt" (findAllActive/findDeleted)
          mockSelectWhere2(...args);
        } else if (whereCallCount === 3) {
          // Third where call is only "deletedAt" (findActive)
          mockSelectWhere3(...args);
        }
        return selectChain;
      }),
      execute: mockSelectExecute,
      executeTakeFirst: mockSelectExecuteTakeFirst,
    };

    vi.mocked(db.updateTable).mockReturnValue({
      where: mockUpdateWhere,
      set: mockUpdateSet,
      execute: mockUpdateExecute,
    } as unknown as ReturnType<typeof db.updateTable>);

    vi.mocked(db.selectFrom).mockReturnValue(
      selectChain as unknown as ReturnType<typeof db.selectFrom>,
    );

    service = new SoftDeleteService("K8sClusterConfig");
  });

  describe("softDelete", () => {
    it("sets deletedAt timestamp when soft deleting a record", async () => {
      await service.softDelete(1, "user_123");

      expect(db.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", 1);
      expect(mockUpdateWhere).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );

      expect(mockUpdateSet).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(mockUpdateExecute).toHaveBeenCalled();
    });

    it("only updates records matching both id and userId", async () => {
      await service.softDelete(5, "user_456");

      expect(mockUpdateWhere).toHaveBeenCalledTimes(2);
      expect(mockUpdateWhere).toHaveBeenNthCalledWith(1, "id", "=", 5);
      expect(mockUpdateWhere).toHaveBeenNthCalledWith(
        2,
        "authUserId",
        "=",
        "user_456",
      );
    });

    it("handles database errors gracefully", async () => {
      mockUpdateExecute.mockRejectedValue(new Error("Database error"));

      await expect(service.softDelete(1, "user_123")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("restore", () => {
    it("sets deletedAt to null when restoring a record", async () => {
      await service.restore(2, "user_789");

      expect(db.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", 2);
      expect(mockUpdateWhere).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_789",
      );
      expect(mockUpdateSet).toHaveBeenCalledWith({ deletedAt: null });
      expect(mockUpdateExecute).toHaveBeenCalled();
    });

    it("only restores records matching both id and userId", async () => {
      await service.restore(10, "user_abc");

      expect(mockUpdateWhere).toHaveBeenCalledTimes(2);
      expect(mockUpdateWhere).toHaveBeenNthCalledWith(1, "id", "=", 10);
      expect(mockUpdateWhere).toHaveBeenNthCalledWith(
        2,
        "authUserId",
        "=",
        "user_abc",
      );
    });

    it("handles database errors gracefully", async () => {
      mockUpdateExecute.mockRejectedValue(new Error("Connection failed"));

      await expect(service.restore(3, "user_123")).rejects.toThrow(
        "Connection failed",
      );
    });
  });

  describe("findActive", () => {
    it("finds a single active record by id and userId", async () => {
      const mockCluster = { id: 1, name: "test-cluster", deletedAt: null };
      mockSelectExecuteTakeFirst.mockResolvedValue(mockCluster);

      const result = await service.findActive(1, "user_123");

      expect(result).toEqual(mockCluster);
      expect(mockSelectWhere1).toHaveBeenCalledWith("id", "=", 1);
      expect(mockSelectWhere2).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );
      expect(mockSelectWhere3).toHaveBeenCalledWith("deletedAt", "is", null);
      expect(mockSelectExecuteTakeFirst).toHaveBeenCalled();
    });

    it("returns null when active record not found", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      const result = await service.findActive(999, "user_123");

      expect(result).toBeNull();
    });

    it("excludes soft-deleted records from results", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      await service.findActive(2, "user_123");

      expect(mockSelectWhere3).toHaveBeenCalledWith("deletedAt", "is", null);
    });

    it("enforces user ownership when finding active record", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      await service.findActive(1, "user_xyz");

      expect(mockSelectWhere2).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_xyz",
      );
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecuteTakeFirst.mockRejectedValue(new Error("Query failed"));

      await expect(service.findActive(1, "user_123")).rejects.toThrow(
        "Query failed",
      );
    });
  });

  describe("findAllActive", () => {
    it("returns all active records for a user", async () => {
      const mockClusters = [
        { id: 1, name: "cluster-1", deletedAt: null },
        { id: 2, name: "cluster-2", deletedAt: null },
        { id: 3, name: "cluster-3", deletedAt: null },
      ];
      mockSelectExecute.mockResolvedValue(mockClusters);

      const result = await service.findAllActive("user_123");

      expect(result).toEqual(mockClusters);
      expect(result.length).toBe(3);
      expect(mockSelectWhere1).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );
      expect(mockSelectWhere2).toHaveBeenCalledWith("deletedAt", "is", null);
      expect(mockSelectExecute).toHaveBeenCalled();
    });

    it("returns empty array when no active records exist", async () => {
      mockSelectExecute.mockResolvedValue([]);

      const result = await service.findAllActive("user_123");

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("excludes soft-deleted records from results", async () => {
      const mockActiveClusters = [
        { id: 1, name: "active-cluster", deletedAt: null },
        { id: 3, name: "another-active", deletedAt: null },
      ];
      mockSelectExecute.mockResolvedValue(mockActiveClusters);

      await service.findAllActive("user_123");

      expect(mockSelectWhere2).toHaveBeenCalledWith("deletedAt", "is", null);
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecute.mockRejectedValue(new Error("Connection error"));

      await expect(service.findAllActive("user_123")).rejects.toThrow(
        "Connection error",
      );
    });

    it("only returns records for the specified user", async () => {
      mockSelectExecute.mockResolvedValue([]);

      await service.findAllActive("user_specific");

      expect(mockSelectWhere1).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_specific",
      );
    });
  });

  describe("findDeleted", () => {
    it("returns all soft-deleted records for a user", async () => {
      const mockDeletedClusters = [
        { id: 1, name: "deleted-1", deletedAt: new Date() },
        { id: 2, name: "deleted-2", deletedAt: new Date() },
      ];
      mockSelectExecute.mockResolvedValue(mockDeletedClusters);

      const result = await service.findDeleted("user_123");

      expect(result).toEqual(mockDeletedClusters);
      expect(result.length).toBe(2);
      expect(mockSelectWhere1).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );
      expect(mockSelectWhere2).toHaveBeenCalledWith(
        "deletedAt",
        "is not",
        null,
      );
      expect(mockSelectExecute).toHaveBeenCalled();
    });

    it("returns empty array when no deleted records exist", async () => {
      mockSelectExecute.mockResolvedValue([]);

      const result = await service.findDeleted("user_123");

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("excludes active records from results", async () => {
      const mockDeletedClusters = [
        { id: 2, name: "deleted-cluster", deletedAt: new Date() },
      ];
      mockSelectExecute.mockResolvedValue(mockDeletedClusters);

      await service.findDeleted("user_123");

      expect(mockSelectWhere2).toHaveBeenCalledWith(
        "deletedAt",
        "is not",
        null,
      );
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecute.mockRejectedValue(new Error("Query error"));

      await expect(service.findDeleted("user_123")).rejects.toThrow(
        "Query error",
      );
    });

    it("only returns deleted records for the specified user", async () => {
      mockSelectExecute.mockResolvedValue([]);

      await service.findDeleted("user_specific");

      expect(mockSelectWhere1).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_specific",
      );
    });
  });

  describe("type safety", () => {
    it("accepts valid table names from DB schema", () => {
      const validService1 = new SoftDeleteService("K8sClusterConfig");
      expect(validService1).toBeInstanceOf(SoftDeleteService);
    });

    it("enforces type safety with generic type parameter", () => {
      const service = new SoftDeleteService<"K8sClusterConfig">(
        "K8sClusterConfig",
      );
      expect(service).toBeInstanceOf(SoftDeleteService);
    });
  });
});
