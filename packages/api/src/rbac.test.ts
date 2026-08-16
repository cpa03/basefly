/**
 * RBAC Middleware Tests
 *
 * Behavioral tests for the `requireRole` middleware factory and
 * `createRoleBasedProcedure` in `packages/api/src/trpc.ts`.
 *
 * These tests exercise the actual middleware chain (authentication check,
 * database role lookup, audit logging, and error codes) through a real
 * tRPC caller with a mocked database and logger.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@saasfly/db";

// Mock the database before importing trpc.ts (which imports @saasfly/db at
// module scope and would otherwise attempt real DB initialization).
const { mockExecuteTakeFirst, mockLogger } = vi.hoisted(() => ({
  mockExecuteTakeFirst: vi.fn(),
  mockLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: () => ({
      select: () => ({
        where: () => ({
          executeTakeFirst: mockExecuteTakeFirst,
        }),
      }),
    }),
  },
  Role: {
    USER: "USER",
    ADMIN: "ADMIN",
  },
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the logger to assert audit logging behavior.
vi.mock("./logger", () => ({
  logger: mockLogger,
}));

// Import AFTER mocks are registered.
import {
  createRoleBasedProcedure,
  createTRPCContext,
  createTRPCRouter,
  requireRole,
  type TRPCContext,
} from "./trpc";

function createTestContext(overrides: Partial<TRPCContext> = {}): TRPCContext {
  return {
    userId: "user-123",
    requestId: "req-123",
    rateLimitInfo: null,
    role: null,
    headers: new Headers({ "x-request-id": "req-123" }),
    auth: {
      userId: "user-123",
      sessionId: "sess-123",
      getToken: vi.fn() as never,
      claims: {},
    } as unknown as TRPCContext["auth"],
    req: undefined,
    ...overrides,
  };
}

describe("requireRole middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should deny access with UNAUTHORIZED when no userId is present", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.ADMIN });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "ok"),
    });
    const caller = router.createCaller(
      createTestContext({ userId: null, auth: null }),
    );

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("should deny access with FORBIDDEN when user role does not match", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.USER });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "ok"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("should deny access with FORBIDDEN when user has no role record", async () => {
    mockExecuteTakeFirst.mockResolvedValue(undefined);
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "ok"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("should allow access and resolve data when role matches", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.ADMIN });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "admin-data"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).resolves.toBe("admin-data");
  });

  it("should emit an audit log entry when role access is granted", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.ADMIN });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "admin-data"),
    });
    const caller = router.createCaller(createTestContext());

    await caller.adminOnly();

    const infoCalls = mockLogger.info.mock.calls as [
      Record<string, unknown>,
      string,
    ][];
    const auditCall = infoCalls.find(
      ([meta]) => meta.action === "role_access_granted",
    );

    expect(auditCall).toBeDefined();
    expect(auditCall?.[0]).toMatchObject({
      audit: true,
      security: true,
      role: Role.ADMIN,
      userId: "user-123",
      requestId: "req-123",
    });
  });

  it("should log a warning when role access is denied", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.USER });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "admin-data"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    const warnCalls = mockLogger.warn.mock.calls as [
      Record<string, unknown>,
      string,
    ][];
    expect(
      warnCalls.some(([meta]) => meta.reason === "insufficient_role"),
    ).toBe(true);
  });

  it("should handle database errors by denying access with FORBIDDEN", async () => {
    mockExecuteTakeFirst.mockRejectedValue(new Error("db down"));
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "admin-data"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("should export a factory that composes authentication and role enforcement", () => {
    expect(typeof requireRole).toBe("function");
    expect(typeof createRoleBasedProcedure).toBe("function");

    // requireRole(Role.ADMIN) returns a middleware builder accepted by .use()
    const procedure = createRoleBasedProcedure(Role.ADMIN);
    expect(procedure).toBeDefined();
    expect(typeof procedure.query).toBe("function");
  });
});

describe("createTRPCContext with role field", () => {
  it("should initialize role to null in context", () => {
    const ctx = createTRPCContext({
      headers: new Headers({
        "x-request-id": "d1c59fa1-6f9c-4c61-8e09-34d219667fd8",
      }),
      auth: { userId: "u1", sessionId: "s1" } as TRPCContext["auth"],
    });

    expect(ctx.role).toBeNull();
    expect(ctx.userId).toBe("u1");
    expect(ctx.requestId).toBe("d1c59fa1-6f9c-4c61-8e09-34d219667fd8");
  });
});

describe("adminProcedure audit logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit role_access_granted audit log via database role path", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.ADMIN });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "ok"),
    });
    const caller = router.createCaller(createTestContext());

    await caller.adminOnly();

    const infoCalls = mockLogger.info.mock.calls as [
      Record<string, unknown>,
      string,
    ][];
    expect(
      infoCalls.some(
        ([meta]) => meta.action === "role_access_granted" && meta.audit === true,
      ),
    ).toBe(true);
  });

  it("should deny non-admin users through the composed middleware", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: Role.USER });
    const router = createTRPCRouter({
      adminOnly: createRoleBasedProcedure(Role.ADMIN).query(() => "ok"),
    });
    const caller = router.createCaller(createTestContext());

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
