import { describe, expect, it, vi } from "vitest";

// Mock @vercel/postgres-kysely before importing db-instance
const mockCreateKysely = vi.fn();

vi.mock("@vercel/postgres-kysely", () => ({
  createKysely: (...args: unknown[]) => mockCreateKysely(...args),
}));

describe("db-instance", () => {
  it("should create a database instance on import", async () => {
    // Reset mock and set return value
    mockCreateKysely.mockReturnValue({});

    // Dynamic import to trigger module evaluation
    const dbModule = await import("./db-instance");

    expect(dbModule).toBeDefined();
    expect(dbModule.db).toBeDefined();
    expect(mockCreateKysely).toHaveBeenCalledTimes(1);
  });

  it("should export a db object with Kysely-like interface", async () => {
    const mockDb = {
      selectFrom: vi.fn(),
      insertInto: vi.fn(),
      updateTable: vi.fn(),
      deleteFrom: vi.fn(),
      transaction: vi.fn(),
    };
    mockCreateKysely.mockReturnValue(mockDb);

    // Clear the module cache to re-evaluate the import
    vi.resetModules();
    const dbModule = await import("./db-instance");

    expect(dbModule.db).toHaveProperty("selectFrom");
    expect(dbModule.db).toHaveProperty("insertInto");
    expect(dbModule.db).toHaveProperty("updateTable");
    expect(dbModule.db).toHaveProperty("deleteFrom");
    expect(dbModule.db).toHaveProperty("transaction");
  });
});
