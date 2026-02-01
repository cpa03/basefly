import { describe, it, expect, beforeEach, vi } from "vitest";
import { executeIdempotentWebhook, registerWebhookEvent, markEventAsProcessed, hasEventBeenProcessed } from "@saasfly/db/webhook-idempotency";
import { db } from "@saasfly/db";

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

      const result = await registerWebhookEvent("evt_test123", "checkout.session.completed");

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

      const result = await registerWebhookEvent("evt_test123", "checkout.session.completed");

      expect(result).toBe(false);
    });

    it("should throw for non-duplicate errors", async () => {
      const mockInsert = vi.fn().mockRejectedValue(new Error("Database connection failed"));
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
      vi.mocked(db.updateTable).mockReturnValue({
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
      vi.mocked(db.updateTable).mockReturnValue({
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

      vi.mocked(db.updateTable).mockReturnValue({
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
});
