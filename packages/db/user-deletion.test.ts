/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "./index";
import { UserDeletionService } from "./user-deletion";

vi.mock("./index", () => ({
  db: {
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn(),
    }),
    selectFrom: vi.fn(),
  },
}));

describe("UserDeletionService", () => {
  let service: UserDeletionService;
  let mockTrx: {
    updateTable: ReturnType<typeof vi.fn>;
    deleteFrom: ReturnType<typeof vi.fn>;
  };
  let mockUpdateWhere: ReturnType<typeof vi.fn>;
  let mockUpdateSet: ReturnType<typeof vi.fn>;
  let mockUpdateExecute: ReturnType<typeof vi.fn>;
  let mockDeleteWhere: ReturnType<typeof vi.fn>;
  let mockDeleteExecute: ReturnType<typeof vi.fn>;
  let mockSelectAll: ReturnType<typeof vi.fn>;
  let mockSelectWhere: any;
  let mockSelectExecute: ReturnType<typeof vi.fn>;
  let mockSelectExecuteTakeFirst: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdateWhere = vi.fn().mockReturnThis();
    mockUpdateSet = vi.fn().mockReturnThis();
    mockUpdateExecute = vi.fn().mockResolvedValue(undefined);

    mockDeleteWhere = vi.fn().mockReturnThis();
    mockDeleteExecute = vi.fn().mockResolvedValue(undefined);

    mockSelectAll = vi.fn().mockReturnThis();
    mockSelectWhere = vi.fn().mockReturnThis();
    mockSelectExecute = vi.fn().mockResolvedValue([]);
    mockSelectExecuteTakeFirst = vi.fn().mockResolvedValue(null);

    mockTrx = {
      updateTable: vi.fn().mockReturnValue({
        where: mockUpdateWhere,
        set: mockUpdateSet,
        execute: mockUpdateExecute,
      }),
      deleteFrom: vi.fn().mockReturnValue({
        where: mockDeleteWhere,
        execute: mockDeleteExecute,
      }),
    };

    // Mock db.transaction().execute(callback) pattern

    // @ts-expect-error Complex transaction mock type
    vi.mocked(db.transaction).mockReturnValue({
      execute: vi
        .fn()
        .mockImplementation(
          (callback: (trx: typeof mockTrx) => Promise<unknown>) => {
            return callback(mockTrx);
          },
        ),
    });

    // Create a chainable mock object for select queries
    const createSelectChain = () => ({
      selectAll: mockSelectAll,
      select: vi.fn().mockReturnThis(),
      where: vi.fn((...args: unknown[]) => {
        mockSelectWhere(...args);
        return createSelectChain();
      }),
      execute: mockSelectExecute,
      executeTakeFirst: mockSelectExecuteTakeFirst,
    });
    const selectChain = createSelectChain();

    // @ts-expect-error Complex query builder mock type
    vi.mocked(db.selectFrom).mockReturnValue(
      selectChain as unknown as {
        selectAll: ReturnType<typeof vi.fn>;
        where: ReturnType<typeof vi.fn>;
        execute: ReturnType<typeof vi.fn>;
        executeTakeFirst: ReturnType<typeof vi.fn>;
      },
    );

    service = new UserDeletionService();
  });

  describe("deleteUser", () => {
    it("soft deletes all K8s clusters before hard deleting user", async () => {
      await service.deleteUser("user_123");

      expect(db.transaction).toHaveBeenCalled();
      expect(mockTrx.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockUpdateWhere).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );
      expect(mockUpdateWhere).toHaveBeenCalledWith("deletedAt", "is", null);

      expect(mockUpdateSet).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(mockUpdateExecute).toHaveBeenCalled();
    });

    it("hard deletes Customer record for the user", async () => {
      await service.deleteUser("user_456");

      expect(mockTrx.deleteFrom).toHaveBeenCalledWith("Customer");
      expect(mockDeleteWhere).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_456",
      );
      expect(mockDeleteExecute).toHaveBeenCalled();
    });

    it("hard deletes User record at the end", async () => {
      await service.deleteUser("user_789");

      expect(mockTrx.deleteFrom).toHaveBeenCalledWith("User");
      expect(mockDeleteWhere).toHaveBeenCalledWith("id", "=", "user_789");
      expect(mockDeleteExecute).toHaveBeenCalled();
    });

    it("executes all operations within a single transaction", async () => {
      await service.deleteUser("user_123");

      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(mockTrx.updateTable).toHaveBeenCalledTimes(1);
      expect(mockTrx.deleteFrom).toHaveBeenCalledTimes(2);
    });

    it("handles database errors and rolls back transaction", async () => {
      mockUpdateExecute.mockRejectedValue(new Error("Database error"));

      await expect(service.deleteUser("user_123")).rejects.toThrow(
        "Database error",
      );
    });

    it("only soft deletes active clusters (deletedAt is null)", async () => {
      await service.deleteUser("user_123");

      expect(mockUpdateWhere).toHaveBeenCalledWith("deletedAt", "is", null);
    });

    it("preserves audit trail by soft deleting clusters before hard deletion", async () => {
      await service.deleteUser("user_123");

      expect(mockTrx.updateTable).toHaveBeenCalled();

      expect(mockUpdateSet).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
      expect(mockTrx.deleteFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe("softDeleteUser", () => {
    it("soft deletes all K8s clusters for user", async () => {
      await service.softDeleteUser("user_123");

      expect(db.transaction).toHaveBeenCalled();
      expect(mockTrx.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockUpdateWhere).toHaveBeenCalledWith(
        "authUserId",
        "=",
        "user_123",
      );
      expect(mockUpdateWhere).toHaveBeenCalledWith("deletedAt", "is", null);

      expect(mockUpdateSet).toHaveBeenCalledWith({
        deletedAt: expect.any(Date),
      });
    });

    it("updates user email to preserve compliance audit trail", async () => {
      await service.softDeleteUser("user_456");

      expect(mockTrx.updateTable).toHaveBeenCalledWith("User");
      expect(mockUpdateWhere).toHaveBeenCalledWith("id", "=", "user_456");
      expect(mockUpdateSet).toHaveBeenCalledWith({
        email: `deleted_user_456@example.com`,
      });
    });

    it("preserves User record for compliance requirements", async () => {
      await service.softDeleteUser("user_789");

      expect(mockTrx.deleteFrom).not.toHaveBeenCalled();
      expect(mockTrx.updateTable).toHaveBeenCalledTimes(2);
    });

    it("executes all operations within a single transaction", async () => {
      await service.softDeleteUser("user_123");

      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(mockTrx.updateTable).toHaveBeenCalledTimes(2);
      expect(mockTrx.deleteFrom).not.toHaveBeenCalled();
    });

    it("handles database errors and rolls back transaction", async () => {
      mockUpdateExecute.mockRejectedValue(new Error("Connection error"));

      await expect(service.softDeleteUser("user_123")).rejects.toThrow(
        "Connection error",
      );
    });

    it("uses deterministic email format for soft-deleted users", async () => {
      await service.softDeleteUser("user_abc");

      expect(mockUpdateSet).toHaveBeenCalledWith({
        email: `deleted_user_abc@example.com`,
      });
    });
  });

  describe("getUserSummary", () => {
    it("returns user information when user exists", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
        image: "avatar.jpg",
      };
      mockSelectExecuteTakeFirst.mockResolvedValue(mockUser);

      const result = await service.getUserSummary("user_123");

      expect(result).toBeDefined();
      expect(result?.user).toEqual(mockUser);
      expect(mockSelectWhere).toHaveBeenCalledWith("id", "=", "user_123");
    });

    it("returns null when user does not exist", async () => {
      mockSelectExecuteTakeFirst.mockResolvedValue(null);

      const result = await service.getUserSummary("nonexistent");

      expect(result).toBeNull();
    });

    it("includes customer information when customer exists", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };
      const mockCustomer = {
        id: 1,
        authUserId: "user_123",
        plan: "PRO",
        stripeCustomerId: "cus_123",
      };

      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockCustomer);
      mockSelectExecute.mockResolvedValue([]);

      const result = await service.getUserSummary("user_123");

      expect(result?.customer).toEqual(mockCustomer);
    });

    it("includes active clusters count in summary", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };
      const mockClusters = [
        { id: 1, name: "cluster-1", deletedAt: null },
        { id: 2, name: "cluster-2", deletedAt: null },
        { id: 3, name: "cluster-3", deletedAt: null },
      ];

      // First call (User) returns mockUser, second call (Customer) returns null
      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockSelectExecute.mockResolvedValue(mockClusters);

      const result = await service.getUserSummary("user_123");

      expect(result?.activeClusters).toBe(3);
    });

    it("includes all active clusters in summary", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };
      const mockClusters = [
        { id: 1, name: "cluster-1", deletedAt: null },
        { id: 2, name: "cluster-2", deletedAt: null },
      ];

      // First call (User) returns mockUser, second call (Customer) returns null
      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockSelectExecute.mockResolvedValue(mockClusters);

      const result = await service.getUserSummary("user_123");

      expect(result?.clusters).toEqual(mockClusters);
      expect(result?.clusters.length).toBe(2);
    });

    it("only counts active clusters (deletedAt is null)", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };
      const mockActiveClusters = [
        { id: 1, name: "cluster-1", deletedAt: null },
      ];

      // First call (User) returns mockUser, second call (Customer) returns null
      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockSelectExecute.mockResolvedValue(mockActiveClusters);

      await service.getUserSummary("user_123");

      expect(mockSelectWhere).toHaveBeenCalledWith("deletedAt", "is", null);
    });

    it("handles database errors gracefully", async () => {
      mockSelectExecuteTakeFirst.mockRejectedValue(new Error("Query failed"));

      await expect(service.getUserSummary("user_123")).rejects.toThrow(
        "Query failed",
      );
    });

    it("returns correct summary structure", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };
      const mockCustomer = {
        id: 1,
        authUserId: "user_123",
        plan: "FREE",
        stripeCustomerId: null,
      };
      const mockClusters = [{ id: 1, name: "cluster-1", deletedAt: null }];

      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockCustomer);
      mockSelectExecute.mockResolvedValueOnce(mockClusters);

      const result = await service.getUserSummary("user_123");

      expect(result).toEqual({
        user: mockUser,
        customer: mockCustomer,
        activeClusters: 1,
        clusters: mockClusters,
      });
    });

    it("returns null customer when customer does not exist", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };

      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockSelectExecute.mockResolvedValue([]);

      const result = await service.getUserSummary("user_123");

      expect(result?.customer).toBeNull();
    });

    it("returns zero active clusters count when no clusters exist", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test",
        email: "test@example.com",
        image: null,
      };

      // First call (User) returns mockUser, second call (Customer) returns null
      mockSelectExecuteTakeFirst
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockSelectExecute.mockResolvedValue([]);

      const result = await service.getUserSummary("user_123");

      expect(result?.activeClusters).toBe(0);
      expect(result?.clusters).toEqual([]);
    });
  });
});
