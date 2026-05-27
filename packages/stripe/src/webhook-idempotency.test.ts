/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@saasfly/db";

import {
  cleanupOldWebhookEvents,
  executeIdempotentWebhook,
  hasEventBeenProcessed,
  markEventAsProcessed,
  registerWebhookEvent,
} from "./webhook-idempotency";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    insertInto: vi.fn(),
    updateTable: vi.fn(),
    deleteFrom: vi.fn(),
  },
}));

describe("Webhook Idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerWebhookEvent", () => {
    it("should successfully register a new webhook event", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        numInsertedRows: 1n,
      });
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      const result = await registerWebhookEvent(
        "evt_test123",
        "checkout.session.completed",
      );

      expect(result).toBe(true);
      expect(db.insertInto).toHaveBeenCalledWith("StripeWebhookEvent");
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should return false for duplicate event", async () => {
      const mockInsert = vi.fn().mockRejectedValue({
        code: "23505",
        constraint: "StripeWebhookEvent_pkey",
      });
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      const result = await registerWebhookEvent(
        "evt_test123",
        "checkout.session.completed",
      );

      expect(result).toBe(false);
    });

    it("should throw for non-duplicate errors", async () => {
      const mockInsert = vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      await expect(
        registerWebhookEvent("evt_test123", "checkout.session.completed"),
      ).rejects.toThrow();
    });
  });

  describe("hasEventBeenProcessed", () => {
    it("should return true when event exists", async () => {
      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue({
              id: "evt_test123",
              processed: true,
            }),
          } as any),
        } as any),
      } as any);

      const result = await hasEventBeenProcessed("evt_test123");

      expect(result).toBe(true);
    });

    it("should return false when event does not exist", async () => {
      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue(undefined),
          } as any),
        } as any),
      } as any);

      const result = await hasEventBeenProcessed("evt_test123");

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      vi.mocked(db.selectFrom).mockReturnValue({
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockRejectedValue(new Error("DB error")),
          } as any),
        } as any),
      } as any);

      const result = await hasEventBeenProcessed("evt_test123");

      expect(result).toBe(false);
    });
  });

  describe("markEventAsProcessed", () => {
    it("should successfully mark event as processed", async () => {
      const mockExecute = vi.fn().mockResolvedValue({
        numUpdatedRows: 1n,
      });
      (vi.mocked(db.updateTable) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            execute: mockExecute,
          } as any),
        } as any),
      } as any);

      await markEventAsProcessed("evt_test123");

      expect(db.updateTable).toHaveBeenCalledWith("StripeWebhookEvent");
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should throw on database error", async () => {
      (vi.mocked(db.updateTable) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error("DB error")),
          } as any),
        } as any),
      } as any);

      await expect(markEventAsProcessed("evt_test123")).rejects.toThrow();
    });
  });

  describe("executeIdempotentWebhook", () => {
    it("should execute handler for new event", async () => {
      const mockRegister = vi.fn().mockResolvedValue(true);
      const mockMarkProcessed = vi.fn().mockResolvedValue(undefined);
      const handler = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockRegister,
        } as any),
      } as any);

      (vi.mocked(db.updateTable) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            execute: mockMarkProcessed,
          } as any),
        } as any),
      } as any);

      const result = await executeIdempotentWebhook(
        "evt_test123",
        "checkout.session.completed",
        handler,
      );

      expect(mockRegister).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(mockMarkProcessed).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should skip handler for duplicate event", async () => {
      const mockRegister = vi.fn().mockRejectedValue({
        code: "23505",
      });
      const handler = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockRegister,
        } as any),
      } as any);

      const result = await executeIdempotentWebhook(
        "evt_test123",
        "checkout.session.completed",
        handler,
      );

      expect(mockRegister).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it("should propagate handler errors", async () => {
      const mockRegister = vi.fn().mockResolvedValue(true);
      const handler = vi.fn().mockRejectedValue(new Error("Handler failed"));

      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockRegister,
        } as any),
      } as any);

      await expect(
        executeIdempotentWebhook(
          "evt_test123",
          "checkout.session.completed",
          handler,
        ),
      ).rejects.toThrow("Handler failed");

      expect(handler).toHaveBeenCalled();
    });
  });

  describe("cleanupOldWebhookEvents", () => {
    it("should delete old processed events and return count", async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        numDeletedRows: 5n,
      });
      (vi.mocked(db.deleteFrom) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: mockDelete,
          } as any),
        } as any),
      } as any);

      const result = await cleanupOldWebhookEvents(90);

      expect(result).toBe(5);
      expect(db.deleteFrom).toHaveBeenCalledWith("StripeWebhookEvent");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should return 0 when no events to clean up", async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        numDeletedRows: 0n,
      });
      (vi.mocked(db.deleteFrom) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: mockDelete,
          } as any),
        } as any),
      } as any);

      const result = await cleanupOldWebhookEvents(90);

      expect(result).toBe(0);
    });

    it("should use default retention of 90 days", async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        numDeletedRows: 3n,
      });
      (vi.mocked(db.deleteFrom) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: mockDelete,
          } as any),
        } as any),
      } as any);

      const result = await cleanupOldWebhookEvents();

      expect(result).toBe(3);
    });

    it("should return 0 on database error", async () => {
      (vi.mocked(db.deleteFrom) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirst: vi
              .fn()
              .mockRejectedValue(new Error("DB connection lost")),
          } as any),
        } as any),
      } as any);

      const result = await cleanupOldWebhookEvents(90);

      expect(result).toBe(0);
    });
  });

  describe("registerWebhookEvent edge cases (isDuplicateKeyError coverage)", () => {
    it("should throw IntegrationError for non-object errors", async () => {
      const mockInsert = vi.fn().mockRejectedValue("string error");
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      await expect(
        registerWebhookEvent("evt_test123", "checkout.session.completed"),
      ).rejects.toThrow("Failed to register webhook event");
    });

    it("should throw IntegrationError for error with missing code", async () => {
      const mockInsert = vi.fn().mockRejectedValue({
        message: "Unknown error without code",
      });
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      await expect(
        registerWebhookEvent("evt_test123", "checkout.session.completed"),
      ).rejects.toThrow("Failed to register webhook event");
    });

    it("should throw IntegrationError for non-duplicate error code", async () => {
      const mockInsert = vi.fn().mockRejectedValue({
        code: "23503",
        constraint: "some_foreign_key_violation",
      });
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      await expect(
        registerWebhookEvent("evt_test123", "checkout.session.completed"),
      ).rejects.toThrow("Failed to register webhook event");
    });

    it("should return false for null error", async () => {
      const mockInsert = vi.fn().mockRejectedValue(null);
      vi.mocked(db.insertInto).mockReturnValue({
        values: vi.fn().mockReturnValue({
          execute: mockInsert,
        } as any),
      } as any);

      await expect(
        registerWebhookEvent("evt_test123", "checkout.session.completed"),
      ).rejects.toThrow("Failed to register webhook event");
    });
  });

  describe("executeIdempotentWebhook race conditions", () => {
    it("should handle concurrent duplicate event gracefully", async () => {
      const handler = vi.fn().mockResolvedValue({ success: true });

      const mockInsertSuccess = vi
        .fn()
        .mockResolvedValue({ numInsertedRows: 1n });
      const mockInsertFail = vi
        .fn()
        .mockRejectedValue({ code: "23505", constraint: "StripeWebhookEvent_pkey" });

      let callCount = 0;
      vi.mocked(db.insertInto).mockImplementation(() => {
        callCount++;
        const execute =
          callCount === 1 ? mockInsertSuccess : mockInsertFail;
        return {
          values: vi.fn().mockReturnValue({
            execute,
          } as any),
        } as any;
      });

      (vi.mocked(db.updateTable) as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue({ numUpdatedRows: 1n }),
          } as any),
        } as any),
      } as any);

      const registerSpy = vi.spyOn(
        await import("./webhook-idempotency"),
        "registerWebhookEvent",
      );

      const [result1, result2] = await Promise.all([
        executeIdempotentWebhook("evt_race123", "checkout.session.completed", handler),
        executeIdempotentWebhook("evt_race123", "checkout.session.completed", handler),
      ]);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ success: true });
      expect(result2).toBeNull();

      registerSpy.mockRestore();
    });
  });
});
