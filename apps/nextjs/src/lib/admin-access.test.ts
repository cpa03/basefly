/**
 * Admin access helper tests
 *
 * Behavioral tests for `isAdminUser` in `apps/nextjs/src/lib/admin-access.ts`.
 *
 * Covers the RBAC resolution order for page-level admin guards:
 * 1. Database `User.role` column grants access for `ADMIN` role.
 * 2. Legacy `ADMIN_EMAIL` allowlist is used as a migration fallback when the
 *    database record has a non-admin role or is missing.
 * 3. Access is denied when neither the role nor the email allowlist matches.
 *
 * Reference: Issue #498 - [P1][Security] Replace email-based admin RBAC with
 * role-based access control.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isAdminUser } from "./admin-access";

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
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

// Mock the application logger to assert audit-logging behavior.
vi.mock("~/lib/logger", () => ({
  logger: mockLogger,
}));

// Mock the legacy email allowlist helper. ADMIN_EMAIL is read from the
// environment at import time, so control it through process.env.
vi.mock("@saasfly/common", () => ({
  isAdminEmail: (email: string | null | undefined) => {
    const adminEmail = process.env.ADMIN_EMAIL ?? "";
    if (!email || !adminEmail) return false;
    return adminEmail.split(",").some((e) => e.trim() === email);
  },
}));

const ADMIN_EMAIL = "admin@basefly.dev";

describe("isAdminUser", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    mockExecuteTakeFirst.mockReset();
    mockLogger.info.mockReset();
    mockLogger.error.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("grants access when the database role is ADMIN", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: "ADMIN" });

    await expect(
      isAdminUser({ id: "user-1", email: "other@basefly.dev" }),
    ).resolves.toBe(true);
    expect(mockExecuteTakeFirst).toHaveBeenCalledTimes(1);
    // Audit logging fired for role-based grant.
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        audit: true,
        action: "admin_page_access_granted",
      }),
      expect.any(String),
    );
  });

  it("denies access when the database role is USER and email is not in allowlist", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: "USER" });

    await expect(
      isAdminUser({ id: "user-2", email: "user@basefly.dev" }),
    ).resolves.toBe(false);
  });

  it("falls back to the ADMIN_EMAIL allowlist when the database role is USER but email is allowlisted", async () => {
    mockExecuteTakeFirst.mockResolvedValue({ role: "USER" });

    await expect(
      isAdminUser({ id: "user-3", email: ADMIN_EMAIL }),
    ).resolves.toBe(true);
  });

  it("falls back to the email allowlist when no database record exists", async () => {
    mockExecuteTakeFirst.mockResolvedValue(undefined);

    await expect(
      isAdminUser({ id: "user-4", email: ADMIN_EMAIL }),
    ).resolves.toBe(true);
  });

  it("denies access when no database record exists and email is not allowlisted", async () => {
    mockExecuteTakeFirst.mockResolvedValue(undefined);

    await expect(
      isAdminUser({ id: "user-5", email: "user@basefly.dev" }),
    ).resolves.toBe(false);
  });

  it("falls back to the email allowlist when the database lookup fails", async () => {
    mockExecuteTakeFirst.mockRejectedValue(new Error("db down"));

    await expect(
      isAdminUser({ id: "user-6", email: ADMIN_EMAIL }),
    ).resolves.toBe(true);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it("returns false for a null user without an allowlisted email", async () => {
    await expect(isAdminUser(null)).resolves.toBe(false);
    expect(mockExecuteTakeFirst).not.toHaveBeenCalled();
  });

  it("returns true for a null user id with an allowlisted email", async () => {
    await expect(isAdminUser({ id: null, email: ADMIN_EMAIL })).resolves.toBe(
      true,
    );
    expect(mockExecuteTakeFirst).not.toHaveBeenCalled();
  });

  it("returns false when the user has no id and email is not allowlisted", async () => {
    await expect(
      isAdminUser({ id: null, email: "user@basefly.dev" }),
    ).resolves.toBe(false);
    expect(mockExecuteTakeFirst).not.toHaveBeenCalled();
  });
});
