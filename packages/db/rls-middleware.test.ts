import { sql, type Kysely } from "kysely";
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

/**
 * Rollback safety for rlsTransaction (refs #725).
 *
 * Kysely issues ROLLBACK whenever the callback passed to
 * `transaction().execute()` rejects, and COMMIT when it resolves. These
 * tests pin the wrapper contract that makes that possible: failures must
 * propagate out of `rlsTransaction` unchanged (never swallowed, never
 * converted into a successful resolution), and the RLS session variable
 * must be established inside the transaction *before* user code runs.
 */
describe("rlsTransaction rollback safety (refs #725)", () => {
  let mockTrx: Kysely<DB>;
  let executeMock: ReturnType<typeof vi.fn>;
  let mockDb: Kysely<DB>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSqlExecute.mockResolvedValue(undefined);

    mockTrx = {} as unknown as Kysely<DB>;
    executeMock = vi.fn(
      async (callback: (trx: Kysely<DB>) => Promise<unknown>) =>
        callback(mockTrx),
    );
    mockDb = {
      transaction: vi.fn().mockReturnValue({ execute: executeMock }),
    } as unknown as Kysely<DB>;
  });

  it("propagates the original callback error unchanged so the transaction rolls back", async () => {
    const callbackError = new Error("unique_violation");
    const callback = vi.fn().mockRejectedValue(callbackError);

    // A rejected execute() is Kysely's ROLLBACK signal; identity matters
    // (no wrapping, no silent success) or callers lose the failure.
    await expect(
      rlsTransaction(mockDb, "user_rollback", callback),
    ).rejects.toBe(callbackError);

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(mockTrx);
  });

  it("propagates a transaction-layer connection failure unchanged", async () => {
    const connectionError = new Error("connection terminated unexpectedly");
    executeMock.mockRejectedValueOnce(connectionError);

    await expect(
      rlsTransaction(mockDb, "user_connection", vi.fn()),
    ).rejects.toBe(connectionError);
  });

  it("sets the RLS session variable inside the transaction before user code runs", async () => {
    const executionOrder: string[] = [];
    mockSqlExecute.mockImplementation(async () => {
      executionOrder.push("set-session");
    });
    const callback = vi.fn(async () => {
      executionOrder.push("callback");
      return "done";
    });

    const result = await rlsTransaction(mockDb, "user_order", callback);

    expect(result).toBe("done");
    expect(executionOrder).toEqual(["set-session", "callback"]);
    // SET LOCAL must run on the transaction handle, not the outer
    // connection, so the tenant id dies with the transaction.
    expect(mockSqlExecute).toHaveBeenCalledWith(mockTrx);
  });
});

/**
 * Concurrency isolation for rlsTransaction (refs #725).
 *
 * Concurrent transactions must never share a transaction handle or leak
 * another tenant's `app.current_user_id`, and one tenant's failure must
 * not reject a sibling transaction's promise.
 */
describe("rlsTransaction concurrency isolation (refs #725)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSqlExecute.mockResolvedValue(undefined);
  });

  it("keeps concurrent transactions bound to their own tenant context", async () => {
    const trxA = {} as unknown as Kysely<DB>;
    const trxB = {} as unknown as Kysely<DB>;
    const availableTransactions = [trxA, trxB];
    const usedTransactions: Kysely<DB>[] = [];

    const mockDb = {
      transaction: vi.fn().mockImplementation(() => ({
        execute: vi.fn(
          async (callback: (trx: Kysely<DB>) => Promise<unknown>) => {
            const trx =
              availableTransactions.shift() ?? ({} as unknown as Kysely<DB>);
            usedTransactions.push(trx);
            return await callback(trx);
          },
        ),
      })),
    } as unknown as Kysely<DB>;

    const slowTenant = rlsTransaction(mockDb, "tenant_a", async (trx) => {
      // Yield so the sibling transaction starts before this one finishes.
      await new Promise((resolve) => setTimeout(resolve, 25));
      return { trx, result: "a" };
    });
    const fastTenant = rlsTransaction(mockDb, "tenant_b", async (trx) => {
      return { trx, result: "b" };
    });

    const [slowOutcome, fastOutcome] = await Promise.all([
      slowTenant,
      fastTenant,
    ]);

    expect(usedTransactions).toEqual([trxA, trxB]);
    expect(slowOutcome.trx).toBe(trxA);
    expect(fastOutcome.trx).toBe(trxB);
    expect(slowOutcome.result).toBe("a");
    expect(fastOutcome.result).toBe("b");

    const boundTenantIds = (vi.mocked(sql).mock.calls as unknown[][]).map(
      (call) => String(call[1]),
    );
    expect(boundTenantIds).toEqual(["tenant_a", "tenant_b"]);
    expect(mockDb.transaction).toHaveBeenCalledTimes(2);
  });

  it("does not let a failing concurrent transaction reject its sibling", async () => {
    const siblingError = new Error("sibling statement failed");
    let transactionCount = 0;
    const mockDb = {
      transaction: vi.fn().mockImplementation(() => {
        transactionCount += 1;
        const trx = {} as unknown as Kysely<DB>;
        return {
          execute: vi.fn(
            async (callback: (trx: Kysely<DB>) => Promise<unknown>) =>
              await callback(trx),
          ),
        };
      }),
    } as unknown as Kysely<DB>;

    const healthy = rlsTransaction(mockDb, "tenant_healthy", async () => {
      await new Promise((resolve) => setTimeout(resolve, 15));
      return "healthy-result";
    });
    const failing = rlsTransaction(mockDb, "tenant_failing", async () => {
      throw siblingError;
    });

    const [healthyResult, failingResult] = await Promise.allSettled([
      healthy,
      failing,
    ]);

    expect(healthyResult).toEqual({
      status: "fulfilled",
      value: "healthy-result",
    });
    expect(failingResult.status).toBe("rejected");
    if (failingResult.status === "rejected") {
      expect(failingResult.reason).toBe(siblingError);
    }
    expect(transactionCount).toBe(2);
  });
});
