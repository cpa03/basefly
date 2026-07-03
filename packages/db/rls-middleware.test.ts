import type { Kysely } from "kysely";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DB } from "./prisma/types";
import {
  clearRlsSession,
  createRlsHelper,
  rlsTransaction,
  setRlsSession,
} from "./rls-middleware";

vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockSqlExecute = vi.hoisted(() => vi.fn());

vi.mock("kysely", () => ({
  sql: vi.fn(() => ({
    execute: mockSqlExecute,
  })),
}));

describe("setRlsSession", () => {
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {} as unknown as Kysely<DB>;
    mockSqlExecute.mockResolvedValue(undefined);
  });

  it("sets the RLS session variable for the given userId", async () => {
    await setRlsSession(mockDb, "user_abc_123");

    expect(mockSqlExecute).toHaveBeenCalledWith(mockDb);
  });

  it("logs info when session variable is set successfully", async () => {
    const { logger } = await import("./logger");

    await setRlsSession(mockDb, "user_test");

    expect(logger.info).toHaveBeenCalledWith("RLS session variable set", {
      userId: "user_test",
    });
  });

  it("throws and logs error when the SQL execution fails", async () => {
    const dbError = new Error("Connection refused");
    mockSqlExecute.mockRejectedValue(dbError);
    const { logger } = await import("./logger");

    await expect(setRlsSession(mockDb, "user_fail")).rejects.toThrow(
      "Connection refused",
    );
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to set RLS session variable",
      dbError,
      { userId: "user_fail" },
    );
  });
});

describe("clearRlsSession", () => {
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = {} as unknown as Kysely<DB>;
    mockSqlExecute.mockResolvedValue(undefined);
  });

  it("clears the RLS session variable by setting to empty string", async () => {
    await clearRlsSession(mockDb);

    expect(mockSqlExecute).toHaveBeenCalledWith(mockDb);
  });

  it("logs info when session variable is cleared", async () => {
    const { logger } = await import("./logger");

    await clearRlsSession(mockDb);

    expect(logger.info).toHaveBeenCalledWith("RLS session variable cleared");
  });

  it("throws and logs error when clear fails", async () => {
    const dbError = new Error("Database timeout");
    mockSqlExecute.mockRejectedValue(dbError);
    const { logger } = await import("./logger");

    await expect(clearRlsSession(mockDb)).rejects.toThrow("Database timeout");
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to clear RLS session variable",
      dbError,
    );
  });
});

describe("rlsTransaction", () => {
  let mockTrx: any;
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSqlExecute.mockResolvedValue(undefined);

    mockTrx = {} as any;
    mockDb = {
      transaction: vi.fn().mockReturnValue({
        execute: vi
          .fn()
          .mockImplementation(
            (callback: (trx: Kysely<DB>) => Promise<unknown>) =>
              callback(mockTrx),
          ),
      }),
    } as unknown as Kysely<DB>;
  });

  it("sets RLS session variable inside a transaction", async () => {
    const callback = vi.fn().mockResolvedValue("result");

    await rlsTransaction(mockDb, "user_txn", callback);

    expect(mockSqlExecute).toHaveBeenCalledWith(mockTrx);
    expect(callback).toHaveBeenCalledWith(mockTrx);
  });

  it("logs info when RLS session is set in transaction", async () => {
    const { logger } = await import("./logger");
    const callback = vi.fn().mockResolvedValue("ok");

    await rlsTransaction(mockDb, "user_log", callback);

    expect(logger.info).toHaveBeenCalledWith(
      "RLS session variable set in transaction",
      { userId: "user_log" },
    );
  });

  it("executes the callback within the transaction scope", async () => {
    const callback = vi.fn().mockResolvedValue("txn_data");

    const result = await rlsTransaction(mockDb, "user_789", callback);

    expect(result).toBe("txn_data");
  });

  it("propagates callback return value", async () => {
    const returnValue = { id: 1, name: "test" };
    const callback = vi.fn().mockResolvedValue(returnValue);

    const result = await rlsTransaction(mockDb, "user_101", callback);

    expect(result).toEqual(returnValue);
  });

  it("throws when RLS set fails inside transaction", async () => {
    const dbError = new Error("RLS setup failed");
    mockSqlExecute.mockRejectedValue(dbError);
    const callback = vi.fn();

    await expect(rlsTransaction(mockDb, "user_fail", callback)).rejects.toThrow(
      "RLS setup failed",
    );
    expect(callback).not.toHaveBeenCalled();
  });

  it("throws when callback fails inside transaction", async () => {
    const cbError = new Error("Query failed");
    const callback = vi.fn().mockRejectedValue(cbError);

    await expect(rlsTransaction(mockDb, "user_err", callback)).rejects.toThrow(
      "Query failed",
    );
  });
});

describe("createRlsHelper", () => {
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSqlExecute.mockResolvedValue(undefined);

    mockDb = {
      transaction: vi.fn().mockReturnValue({
        execute: vi
          .fn()
          .mockImplementation(
            (callback: (trx: Kysely<DB>) => Promise<unknown>) =>
              callback({} as unknown as Kysely<DB>),
          ),
      }),
    } as unknown as Kysely<DB>;
  });

  it("returns an object with execute and query methods", () => {
    const helper = createRlsHelper(mockDb, "user_helper");

    expect(helper).toHaveProperty("execute");
    expect(helper).toHaveProperty("query");
    expect(typeof helper.execute).toBe("function");
    expect(typeof helper.query).toBe("function");
  });

  it("execute method wraps callback in RLS transaction", async () => {
    const helper = createRlsHelper(mockDb, "user_exec");
    const callback = vi.fn().mockResolvedValue("exec_result");

    const result = await helper.execute(callback);

    expect(result).toBe("exec_result");
    expect(mockSqlExecute).toHaveBeenCalled();
  });

  it("query method wraps callback in RLS transaction", async () => {
    const helper = createRlsHelper(mockDb, "user_query");
    const callback = vi.fn().mockResolvedValue("query_result");

    const result = await helper.query(callback);

    expect(result).toBe("query_result");
    expect(mockSqlExecute).toHaveBeenCalled();
  });

  it("execute re-throws errors from callback", async () => {
    const helper = createRlsHelper(mockDb, "user_err");
    const callback = vi.fn().mockRejectedValue(new Error("Execute error"));

    await expect(helper.execute(callback)).rejects.toThrow("Execute error");
  });

  it("query re-throws errors from callback", async () => {
    const helper = createRlsHelper(mockDb, "user_err");
    const callback = vi.fn().mockRejectedValue(new Error("Query error"));

    await expect(helper.query(callback)).rejects.toThrow("Query error");
  });
});
