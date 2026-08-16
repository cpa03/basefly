/**
 * K8s Router Business Logic Tests
 *
 * Exercises the actual k8sRouter procedures (getClusters, createCluster,
 * updateCluster, deleteCluster) through a real tRPC caller with a mocked
 * database and service layer (refs #551).
 *
 * Covers:
 * - Authentication enforcement (unauthenticated => UNAUTHORIZED)
 * - Cluster ownership verification (NOT_FOUND / FORBIDDEN)
 * - Successful create/update/delete flows
 * - Service error propagation (INTERNAL_SERVER_ERROR)
 * - ISR cache revalidation after mutations
 */

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getLimiter } from "../distributed-rate-limiter";
import type { TRPCContext } from "../trpc";

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the database and cluster service before importing the router.
// k8sClusterService methods are re-assigned per-test to control behavior.
const mockK8sService = vi.hoisted(() => ({
  findAllActive: vi.fn(),
  findActive: vi.fn(),
  create: vi.fn(),
  softDelete: vi.fn(),
}));

const mockDb = vi.hoisted(() => ({
  updateTable: vi.fn(),
}));

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@saasfly/db", () => ({
  db: mockDb,
  k8sClusterService: mockK8sService,
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

// Mock the logger to keep test output clean and assert audit logging.
vi.mock("../logger", () => ({
  logger: mockLogger,
}));

// Mock Next.js cache revalidation (server-only module).
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Import AFTER mocks are registered.
import { k8sRouter } from "./k8s";

// Constants matching production config (packages/common).
const K8S_DEFAULTS = {
  network: "Default",
  plan: "FREE",
};

const ROUTES = {
  dashboard: { home: "/dashboard/" },
};

const OWNER_USER_ID = "owner-user-123";
const OTHER_USER_ID = "other-user-456";

/** Builds a full authenticated TRPCContext for the k8s router. */
function createK8sContext(
  overrides: Partial<TRPCContext> = {},
): TRPCContext {
  return {
    userId: OWNER_USER_ID,
    requestId: "req-k8s-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({
      origin: "http://localhost:3000",
      "x-request-id": "req-k8s-123",
    }),
    auth: {
      userId: OWNER_USER_ID,
      sessionId: "sess-123",
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

/** Returns a caller bound to the given context. */
function createCaller(ctx: TRPCContext) {
  return k8sRouter.createCaller(ctx);
}

describe("k8sRouter - Business Logic", () => {
  const RATE_LIMIT_IDENTIFIER = `user:${OWNER_USER_ID}`;
  const OTHER_LIMIT_IDENTIFIER = `user:${OTHER_USER_ID}`;

  beforeAll(() => {
    // CSRF protection requires a configured app URL and matching Origin.
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  beforeEach(async () => {
    // Fresh mock state per test.
    vi.clearAllMocks();
    mockK8sService.findAllActive.mockResolvedValue([]);
    mockK8sService.findActive.mockResolvedValue(undefined);
    mockK8sService.create.mockResolvedValue({ id: 1 });
    mockK8sService.softDelete.mockResolvedValue(undefined);
    mockDb.updateTable.mockReturnValue({
      where: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Reset rate limit buckets to avoid cross-test interference.
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(OTHER_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(OTHER_LIMIT_IDENTIFIER);
  });

  afterEach(async () => {
    await getLimiter("read").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("read").resetAsync(OTHER_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(RATE_LIMIT_IDENTIFIER);
    await getLimiter("write").resetAsync(OTHER_LIMIT_IDENTIFIER);
  });

  describe("getClusters", () => {
    it("returns all active clusters for the authenticated user", async () => {
      const clusters = [
        {
          id: 1,
          name: "prod-cluster",
          location: "us-west-1",
          network: "Default",
          plan: "FREE",
          status: "RUNNING",
          authUserId: OWNER_USER_ID,
          deletedAt: null,
        },
        {
          id: 2,
          name: "staging-cluster",
          location: "eu-central-1",
          network: "Default",
          plan: "PRO",
          status: "CREATING",
          authUserId: OWNER_USER_ID,
          deletedAt: null,
        },
      ];
      mockK8sService.findAllActive.mockResolvedValue(clusters);

      const caller = createCaller(createK8sContext());
      const result = await caller.getClusters();

      expect(mockK8sService.findAllActive).toHaveBeenCalledWith(
        OWNER_USER_ID,
      );
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("prod-cluster");
    });

    it("returns an empty array when the user has no clusters", async () => {
      mockK8sService.findAllActive.mockResolvedValue([]);

      const caller = createCaller(createK8sContext());
      const result = await caller.getClusters();

      expect(result).toEqual([]);
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = createCaller(
        createK8sContext({ userId: null, auth: null }),
      );

      await expect(caller.getClusters()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(mockK8sService.findAllActive).not.toHaveBeenCalled();
    });
  });

  describe("createCluster", () => {
    it("creates a cluster with defaults and returns id and success", async () => {
      mockK8sService.create.mockResolvedValue({ id: 42 });

      const caller = createCaller(createK8sContext());
      const result = await caller.createCluster({
        name: "my-cluster",
        location: "us-east-1",
      });

      expect(mockK8sService.create).toHaveBeenCalledWith(
        {
          name: "my-cluster",
          location: "us-east-1",
          network: K8S_DEFAULTS.network,
          plan: K8S_DEFAULTS.plan,
        },
        OWNER_USER_ID,
        { requestId: "req-k8s-123" },
      );
      expect(result).toEqual({
        id: 42,
        clusterName: "my-cluster",
        location: "us-east-1",
        success: true,
      });
      // ISR cache invalidation for the dashboard route.
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        `/[lang]${ROUTES.dashboard.home}`,
      );
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = createCaller(
        createK8sContext({ userId: null, auth: null }),
      );

      await expect(
        caller.createCluster({ name: "my-cluster", location: "us-east-1" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(mockK8sService.create).not.toHaveBeenCalled();
    });

    it("throws INTERNAL_SERVER_ERROR when the service returns no record", async () => {
      mockK8sService.create.mockResolvedValue(undefined);

      const caller = createCaller(createK8sContext());

      await expect(
        caller.createCluster({ name: "my-cluster", location: "us-east-1" }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
    });

    it("propagates service failures as INTERNAL_SERVER_ERROR", async () => {
      mockK8sService.create.mockRejectedValue(
        new Error("database connection lost"),
      );

      const caller = createCaller(createK8sContext());

      await expect(
        caller.createCluster({ name: "my-cluster", location: "us-east-1" }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("updateCluster", () => {
    const ownedCluster = {
      id: 7,
      name: "old-name",
      location: "us-west-1",
      network: "Default",
      plan: "FREE",
      status: "RUNNING",
      authUserId: OWNER_USER_ID,
      deletedAt: null,
    };

    it("updates the cluster name", async () => {
      mockK8sService.findActive.mockResolvedValue(ownedCluster);

      const caller = createCaller(createK8sContext());
      const result = await caller.updateCluster({
        id: 7,
        name: "new-name",
      });

      expect(mockK8sService.findActive).toHaveBeenCalledWith(7, OWNER_USER_ID);
      expect(mockDb.updateTable).toHaveBeenCalledWith("K8sClusterConfig");
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalled();
    });

    it("updates the cluster location", async () => {
      mockK8sService.findActive.mockResolvedValue(ownedCluster);

      const caller = createCaller(createK8sContext());
      const result = await caller.updateCluster({
        id: 7,
        location: "eu-west-1",
      });

      expect(result).toEqual({ success: true });
      const updateChain = mockDb.updateTable.mock.results[0]?.value;
      const setFn = updateChain.where().set;
      expect(setFn).toHaveBeenCalledWith({ location: "eu-west-1" });
    });

    it("throws NOT_FOUND when the cluster does not exist", async () => {
      mockK8sService.findActive.mockResolvedValue(undefined);

      const caller = createCaller(createK8sContext());

      await expect(
        caller.updateCluster({ id: 999, name: "nope" }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      expect(mockDb.updateTable).not.toHaveBeenCalled();
    });

    it("throws FORBIDDEN when the cluster belongs to another user", async () => {
      mockK8sService.findActive.mockResolvedValue({
        ...ownedCluster,
        authUserId: OTHER_USER_ID,
      });

      const caller = createCaller(createK8sContext());

      await expect(
        caller.updateCluster({ id: 7, name: "hijack" }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(mockDb.updateTable).not.toHaveBeenCalled();
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = createCaller(
        createK8sContext({ userId: null, auth: null }),
      );

      await expect(
        caller.updateCluster({ id: 7, name: "new" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("propagates service failures as INTERNAL_SERVER_ERROR", async () => {
      mockK8sService.findActive.mockRejectedValue(new Error("db down"));

      const caller = createCaller(createK8sContext());

      await expect(
        caller.updateCluster({ id: 7, name: "new" }),
      ).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
    });
  });

  describe("deleteCluster", () => {
    const ownedCluster = {
      id: 9,
      name: "to-delete",
      location: "us-west-1",
      network: "Default",
      plan: "FREE",
      status: "RUNNING",
      authUserId: OWNER_USER_ID,
      deletedAt: null,
    };

    it("soft deletes an owned cluster", async () => {
      mockK8sService.findActive.mockResolvedValue(ownedCluster);

      const caller = createCaller(createK8sContext());
      const result = await caller.deleteCluster({ id: 9 });

      expect(mockK8sService.softDelete).toHaveBeenCalledWith(9, OWNER_USER_ID);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalled();
    });

    it("throws NOT_FOUND when the cluster does not exist", async () => {
      mockK8sService.findActive.mockResolvedValue(undefined);

      const caller = createCaller(createK8sContext());

      await expect(caller.deleteCluster({ id: 999 })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      expect(mockK8sService.softDelete).not.toHaveBeenCalled();
    });

    it("throws FORBIDDEN when the cluster belongs to another user", async () => {
      mockK8sService.findActive.mockResolvedValue({
        ...ownedCluster,
        authUserId: OTHER_USER_ID,
      });

      const caller = createCaller(createK8sContext());

      await expect(caller.deleteCluster({ id: 9 })).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
      expect(mockK8sService.softDelete).not.toHaveBeenCalled();
    });

    it("rejects unauthenticated access with UNAUTHORIZED", async () => {
      const caller = createCaller(
        createK8sContext({ userId: null, auth: null }),
      );

      await expect(caller.deleteCluster({ id: 9 })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("propagates service failures as INTERNAL_SERVER_ERROR", async () => {
      mockK8sService.findActive.mockResolvedValue(ownedCluster);
      mockK8sService.softDelete.mockRejectedValue(new Error("db down"));

      const caller = createCaller(createK8sContext());

      await expect(caller.deleteCluster({ id: 9 })).rejects.toMatchObject({
        code: "INTERNAL_SERVER_ERROR",
      });
    });
  });
});
