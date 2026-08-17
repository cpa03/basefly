import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearSeedData, seed, SEED_CONFIG } from "./seed";

/**
 * Database Seed Script Tests
 *
 * Covers the seed module (seed.ts): production guard, empty-database
 * detection, user/customer/cluster seeding, transaction handling, error
 * handling, and seed-data cleanup. The Kysely `db` instance and logger are
 * mocked so no real database connection is required.
 *
 * @module seed.test
 */

const {
  mockDb,
  mockLogger,
  trx,
  createSelectChain,
  createInsertChain,
  createDeleteChain,
} = vi.hoisted(() => {
  const createSelectChain = (takeFirstResult: unknown) => {
    const chain: any = {
      select: vi.fn(() => chain),
      where: vi.fn(() => chain),
      executeTakeFirst: vi.fn(async () => takeFirstResult),
      execute: vi.fn(async () => []),
    };
    return chain;
  };

  const createInsertChain = () => {
    const chain: any = {
      values: vi.fn(() => chain),
      onConflict: vi.fn(() => chain),
      returning: vi.fn(() => chain),
      execute: vi.fn(async () => undefined),
    };
    return chain;
  };

  const createDeleteChain = () => {
    const chain: any = {
      where: vi.fn(() => chain),
      execute: vi.fn(async () => undefined),
    };
    return chain;
  };

  const trx = {
    deleteFrom: vi.fn(() => createDeleteChain()),
  };

  const db = {
    selectFrom: vi.fn(() => createSelectChain({ count: "0" })),
    insertInto: vi.fn(() => createInsertChain()),
    deleteFrom: vi.fn(() => createDeleteChain()),
    transaction: vi.fn(() => ({
      execute: vi.fn(async (cb: (t: typeof trx) => unknown) => cb(trx)),
    })),
  };

  return {
    mockDb: db,
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    trx,
    createSelectChain,
    createInsertChain,
    createDeleteChain,
  };
});

vi.mock("./db-instance", () => ({ db: mockDb }));
vi.mock("./logger", () => ({ logger: mockLogger }));

describe("seed script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default chain behavior after clearAllMocks.
    mockDb.selectFrom.mockImplementation(() =>
      createSelectChain({ count: "0" }),
    );
    mockDb.insertInto.mockImplementation(() => createInsertChain());
    mockDb.deleteFrom.mockImplementation(() => createDeleteChain());
    mockDb.transaction.mockImplementation(() => ({
      execute: vi.fn(async (cb: (t: typeof trx) => unknown) => cb(trx)),
    }));
  });

  describe("SEED_CONFIG", () => {
    it("exposes the expected test users", () => {
      expect(SEED_CONFIG.testUser.email).toBe("test@example.com");
      expect(SEED_CONFIG.adminUser.email).toBe("admin@example.com");
    });

    it("exposes the expected seed clusters", () => {
      expect(SEED_CONFIG.testClusters).toHaveLength(2);
      expect(SEED_CONFIG.testClusters.map((c) => c.name)).toEqual([
        "dev-cluster-us-east",
        "staging-cluster-eu-west",
      ]);
    });
  });

  describe("seed()", () => {
    it("seeds users, customers, and clusters inside a transaction", async () => {
      await seed();

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(mockDb.insertInto).toHaveBeenCalledWith("User");
      expect(mockDb.insertInto).toHaveBeenCalledWith("Customer");
      expect(mockDb.insertInto).toHaveBeenCalledWith("K8sClusterConfig");
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database seeding completed successfully!",
      );
    });

    it("logs a warning when the database is not empty", async () => {
      mockDb.selectFrom.mockImplementation(() =>
        createSelectChain({ count: "1" }),
      );

      await seed();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Database is not empty. Seed will skip existing records.",
      );
    });

    it("treats a null count result as a non-empty database", async () => {
      mockDb.selectFrom.mockImplementation(() => createSelectChain(null));

      await seed();

      // Number(undefined) is NaN, so the empty check is false.
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Database is not empty. Seed will skip existing records.",
      );
      // Seeding still runs; the empty check only controls the warning.
      expect(mockDb.insertInto).toHaveBeenCalledWith("User");
    });

    it("logs the error and exits when seeding fails", async () => {
      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(
          (() => undefined) as unknown as (
            code?: string | number | null,
          ) => never,
        );

      mockDb.transaction.mockImplementation(() => ({
        execute: vi.fn(async () => {
          throw new Error("Connection refused");
        }),
      }));

      await seed();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Seeding failed with error:",
        expect.any(Error),
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      exitSpy.mockRestore();
    });
  });

  describe("production guard", () => {
    it("exits when NODE_ENV is production", async () => {
      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(
          (() => undefined) as unknown as (
            code?: string | number | null,
          ) => never,
        );

      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();

      await import("./seed");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Seeding is disabled in production environment",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      vi.unstubAllEnvs();
      exitSpy.mockRestore();
    });

    it("clearSeedData throws in production", async () => {
      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(
          (() => undefined) as unknown as (
            code?: string | number | null,
          ) => never,
        );

      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();

      const mod = await import("./seed");
      await expect(mod.clearSeedData()).rejects.toThrow(
        "Cannot clear seed data in production",
      );

      vi.unstubAllEnvs();
      exitSpy.mockRestore();
    });
  });

  describe("clearSeedData()", () => {
    it("deletes seed data for the seed users in a transaction", async () => {
      await clearSeedData();

      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
      expect(trx.deleteFrom).toHaveBeenCalledWith("K8sClusterConfig");
      expect(trx.deleteFrom).toHaveBeenCalledWith("Customer");
      expect(trx.deleteFrom).toHaveBeenCalledWith("User");
      expect(mockLogger.info).toHaveBeenCalledWith("Seed data cleared");
    });
  });
});
