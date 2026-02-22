import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db, k8sClusterService } from "@saasfly/db";

import {
  k8sClusterCreateSchema,
  k8sClusterDeleteSchema,
  k8sClusterUpdateSchema,
  k8sRouter,
} from "./k8s";

vi.mock("@saasfly/db", () => ({
  db: {
    insertInto: vi.fn(),
    updateTable: vi.fn(),
    selectFrom: vi.fn(),
  },
  k8sClusterService: {
    findAllActive: vi.fn(),
    findActive: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock("../logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

function createMockContext(
  userId: string | null,
  requestId = "test-request-id",
) {
  return {
    userId,
    requestId,
    req: undefined,
    rateLimitInfo: null,
    headers: new Headers(),
  };
}

function createMockCaller(userId: string | null) {
  const ctx = createMockContext(userId);
  // @ts-expect-error - Simplified mock for testing
  return k8sRouter.createCaller(ctx);
}

describe("k8sRouter - Schema Validation", () => {
  describe("k8sClusterCreateSchema", () => {
    it("accepts valid cluster creation data", () => {
      const validData = {
        name: "my-cluster",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing name", () => {
      const invalidData = { location: "us-east-1" };
      const result = k8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects missing location", () => {
      const invalidData = { name: "my-cluster" };
      const result = k8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects empty string name", () => {
      const invalidData = {
        name: "",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects name with invalid characters", () => {
      const invalidData = {
        name: "my@cluster#invalid",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects name exceeding max length", () => {
      const invalidData = {
        name: "a".repeat(101), // exceeds CLUSTER_VALIDATION.name.maxLength (100)
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields (strict mode)", () => {
      const dataWithExtra = {
        name: "my-cluster",
        location: "us-east-1",
        extraField: "should be rejected",
      };
      const result = k8sClusterCreateSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(false);
    });

    it("trims whitespace from name and location", () => {
      const data = {
        name: "  my-cluster  ",
        location: "  us-east-1  ",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("my-cluster");
        expect(result.data.location).toBe("us-east-1");
      }
    });
  });

  describe("k8sClusterUpdateSchema", () => {
    it("accepts valid update data with name only", () => {
      const validData = {
        id: 1,
        name: "updated-cluster",
      };
      const result = k8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts valid update data with location only", () => {
      const validData = {
        id: 1,
        location: "us-west-2",
      };
      const result = k8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts valid update data with both name and location", () => {
      const validData = {
        id: 1,
        name: "updated-cluster",
        location: "us-west-2",
      };
      const result = k8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects update without any fields to update", () => {
      const invalidData = { id: 1 };
      const result = k8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) =>
              i.message.includes("At least one field") ||
              i.message.includes("must be provided"),
          ),
        ).toBe(true);
      }
    });

    it("rejects negative id", () => {
      const invalidData = {
        id: -1,
        name: "updated-cluster",
      };
      const result = k8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects zero id", () => {
      const invalidData = {
        id: 0,
        name: "updated-cluster",
      };
      const result = k8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects non-integer id", () => {
      const invalidData = {
        id: 1.5,
        name: "updated-cluster",
      };
      const result = k8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("k8sClusterDeleteSchema", () => {
    it("accepts valid delete data", () => {
      const validData = { id: 1 };
      const result = k8sClusterDeleteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing id", () => {
      const invalidData = {};
      const result = k8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects negative id", () => {
      const invalidData = { id: -1 };
      const result = k8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects zero id", () => {
      const invalidData = { id: 0 };
      const result = k8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects non-integer id", () => {
      const invalidData = { id: 1.5 };
      const result = k8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields (strict mode)", () => {
      const dataWithExtra = {
        id: 1,
        extraField: "should be rejected",
      };
      const result = k8sClusterDeleteSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(false);
    });
  });
});

describe("k8sRouter - getClusters", () => {
  const testUserId = "user-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return clusters for authenticated user", async () => {
    const caller = createMockCaller(testUserId);

    const mockClusters = [
      {
        id: 1,
        name: "cluster-1",
        location: "us-east-1",
        plan: "FREE",
        status: "RUNNING",
        authUserId: testUserId,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "cluster-2",
        location: "us-west-2",
        plan: "PRO",
        status: "RUNNING",
        authUserId: testUserId,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findAllActive).mockResolvedValue(mockClusters);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await caller.getClusters();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(k8sClusterService.findAllActive).toHaveBeenCalledWith(testUserId);
    expect(result).toEqual(mockClusters);
  });

  it("should return empty array when user has no clusters", async () => {
    const caller = createMockCaller(testUserId);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findAllActive).mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await caller.getClusters();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(k8sClusterService.findAllActive).toHaveBeenCalledWith(testUserId);
    expect(result).toEqual([]);
  });

  it("should throw UNAUTHORIZED when user is not authenticated", async () => {
    const caller = createMockCaller(null);

    await expect(caller.getClusters()).rejects.toThrow(TRPCError);

    try {
      await caller.getClusters();
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("UNAUTHORIZED");
    }
  });
});

describe("k8sRouter - createCluster", () => {
  const testUserId = "user-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a cluster successfully", async () => {
    const caller = createMockCaller(testUserId);

    const mockInsertBuilder = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      executeTakeFirst: vi.fn().mockResolvedValue({ id: 1 }),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.insertInto).mockReturnValue(
      mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
    );

    const result = await caller.createCluster({
      name: "my-cluster",
      location: "us-east-1",
    });

    expect(result).toEqual({
      id: 1,
      clusterName: "my-cluster",
      location: "us-east-1",
      success: true,
    });

    expect(mockInsertBuilder.values).toHaveBeenCalled();
  });

  it("should throw INTERNAL_SERVER_ERROR when insert fails", async () => {
    const caller = createMockCaller(testUserId);

    const mockInsertBuilder = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.insertInto).mockReturnValue(
      mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
    );

    await expect(
      caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      }),
    ).rejects.toThrow(TRPCError);

    try {
      await caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should throw INTERNAL_SERVER_ERROR on database error", async () => {
    const caller = createMockCaller(testUserId);

    const mockInsertBuilder = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      executeTakeFirst: vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed")),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.insertInto).mockReturnValue(
      mockInsertBuilder as unknown as ReturnType<typeof db.insertInto>,
    );

    await expect(
      caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      }),
    ).rejects.toThrow(TRPCError);

    try {
      await caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should throw UNAUTHORIZED when user is not authenticated", async () => {
    const caller = createMockCaller(null);

    await expect(
      caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      }),
    ).rejects.toThrow(TRPCError);
  });
});

describe("k8sRouter - updateCluster", () => {
  const testUserId = "user-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update cluster name successfully", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "old-name",
      location: "us-east-1",
      authUserId: testUserId,
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);

    const mockUpdateBuilder = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.updateTable).mockReturnValue(
      mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
    );

    const result = await caller.updateCluster({
      id: 1,
      name: "new-name",
    });

    expect(result).toEqual({ success: true });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(k8sClusterService.findActive).toHaveBeenCalledWith(1, testUserId);
  });

  it("should update cluster location successfully", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "my-cluster",
      location: "us-east-1",
      authUserId: testUserId,
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);

    const mockUpdateBuilder = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.updateTable).mockReturnValue(
      mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
    );

    const result = await caller.updateCluster({
      id: 1,
      location: "us-west-2",
    });

    expect(result).toEqual({ success: true });
  });

  it("should throw NOT_FOUND when cluster does not exist", async () => {
    const caller = createMockCaller(testUserId);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(undefined);

    await expect(
      caller.updateCluster({
        id: 999,
        name: "new-name",
      }),
    ).rejects.toThrow(TRPCError);

    try {
      await caller.updateCluster({
        id: 999,
        name: "new-name",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("NOT_FOUND");
    }
  });

  it("should throw FORBIDDEN when user does not own cluster", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "my-cluster",
      location: "us-east-1",
      authUserId: "different-user-456",
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);

    await expect(
      caller.updateCluster({
        id: 1,
        name: "new-name",
      }),
    ).rejects.toThrow(TRPCError);

    try {
      await caller.updateCluster({
        id: 1,
        name: "new-name",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("FORBIDDEN");
    }
  });

  it("should throw INTERNAL_SERVER_ERROR on database error", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "old-name",
      location: "us-east-1",
      authUserId: testUserId,
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);

    const mockUpdateBuilder = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      execute: vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed")),
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(db.updateTable).mockReturnValue(
      mockUpdateBuilder as unknown as ReturnType<typeof db.updateTable>,
    );

    await expect(
      caller.updateCluster({
        id: 1,
        name: "new-name",
      }),
    ).rejects.toThrow(TRPCError);

    try {
      await caller.updateCluster({
        id: 1,
        name: "new-name",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should throw UNAUTHORIZED when user is not authenticated", async () => {
    const caller = createMockCaller(null);

    await expect(
      caller.updateCluster({
        id: 1,
        name: "new-name",
      }),
    ).rejects.toThrow(TRPCError);
  });
});

describe("k8sRouter - deleteCluster", () => {
  const testUserId = "user-test-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete cluster successfully", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "my-cluster",
      location: "us-east-1",
      authUserId: testUserId,
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.softDelete).mockResolvedValue(undefined);

    const result = await caller.deleteCluster({ id: 1 });

    expect(result).toEqual({ success: true });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(k8sClusterService.findActive).toHaveBeenCalledWith(1, testUserId);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(k8sClusterService.softDelete).toHaveBeenCalledWith(1, testUserId);
  });

  it("should throw NOT_FOUND when cluster does not exist", async () => {
    const caller = createMockCaller(testUserId);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(undefined);

    await expect(caller.deleteCluster({ id: 999 })).rejects.toThrow(TRPCError);

    try {
      await caller.deleteCluster({ id: 999 });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("NOT_FOUND");
    }
  });

  it("should throw FORBIDDEN when user does not own cluster", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "my-cluster",
      location: "us-east-1",
      authUserId: "different-user-456",
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);

    await expect(caller.deleteCluster({ id: 1 })).rejects.toThrow(TRPCError);

    try {
      await caller.deleteCluster({ id: 1 });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("FORBIDDEN");
    }
  });

  it("should throw INTERNAL_SERVER_ERROR on soft delete failure", async () => {
    const caller = createMockCaller(testUserId);

    const mockCluster = {
      id: 1,
      name: "my-cluster",
      location: "us-east-1",
      authUserId: testUserId,
      deletedAt: null,
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.findActive).mockResolvedValue(mockCluster);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(k8sClusterService.softDelete).mockRejectedValue(
      new Error("Database error"),
    );

    await expect(caller.deleteCluster({ id: 1 })).rejects.toThrow(TRPCError);

    try {
      await caller.deleteCluster({ id: 1 });
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError);
      expect((error as TRPCError).code).toBe("INTERNAL_SERVER_ERROR");
    }
  });

  it("should throw UNAUTHORIZED when user is not authenticated", async () => {
    const caller = createMockCaller(null);

    await expect(caller.deleteCluster({ id: 1 })).rejects.toThrow(TRPCError);
  });
});

describe("k8sRouter - Edge Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cluster name validation", () => {
    it("should accept cluster name with hyphens", () => {
      const data = {
        name: "my-production-cluster",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept cluster name with numbers", () => {
      const data = {
        name: "cluster-123",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept cluster name starting with number", () => {
      const data = {
        name: "123-cluster",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject cluster name with spaces", () => {
      const data = {
        name: "my cluster",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept single character cluster name", () => {
      const data = {
        name: "a",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Location validation", () => {
    it("should accept standard AWS region format", () => {
      const data = {
        name: "my-cluster",
        location: "us-east-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept location with numbers", () => {
      const data = {
        name: "my-cluster",
        location: "region-1",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty location", () => {
      const data = {
        name: "my-cluster",
        location: "",
      };
      const result = k8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Large ID handling", () => {
    it("should handle large cluster IDs in update", () => {
      const data = {
        id: Number.MAX_SAFE_INTEGER,
        name: "updated-cluster",
      };
      const result = k8sClusterUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should handle large cluster IDs in delete", () => {
      const data = { id: Number.MAX_SAFE_INTEGER };
      const result = k8sClusterDeleteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
