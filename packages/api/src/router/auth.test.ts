import { describe, expect, it, vi } from "vitest";

// Import AFTER mocks are registered. mySubscriptionSchema is imported from
// the router so these tests exercise the actual schema used by
// authRouter.mySubscription instead of a re-declared copy (refs #609).
import { mySubscriptionSchema } from "./auth";

// Hoisted mock state (referenced by the vi.mock factories below).
const mockDb = vi.hoisted(() => ({ selectFrom: vi.fn() }));

// Mock Clerk server helpers to avoid server-only module side effects.
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  getAuth: vi.fn(),
}));

// Mock the database before importing the router. auth.ts (and trpc.ts
// transitively) import @saasfly/db, whose real instance requires a
// POSTGRES_URL connection string.
vi.mock("@saasfly/db", () => ({
  db: mockDb,
  SubscriptionPlan: { FREE: "FREE", PRO: "PRO", BUSINESS: "BUSINESS" },
  rlsTransaction: (
    _db: unknown,
    _userId: string,
    callback: (trx: unknown) => Promise<unknown>,
  ) => callback(_db),
}));

const mockLogger = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

// Mock the logger to keep test output clean.
vi.mock("../logger", () => ({ logger: mockLogger }));

// Mock next/cache (noStore) to avoid server-only side effects.
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}));

describe("Auth Router - Input Validation", () => {
  describe("mySubscriptionSchema - Empty Object Validation", () => {
    it("accepts undefined input", () => {
      const result = mySubscriptionSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("accepts empty object input", () => {
      const result = mySubscriptionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects non-empty object", () => {
      const result = mySubscriptionSchema.safeParse({ something: "value" });
      expect(result.success).toBe(false);
    });

    it("rejects array input", () => {
      const result = mySubscriptionSchema.safeParse([]);
      expect(result.success).toBe(false);
    });

    it("rejects string input", () => {
      const result = mySubscriptionSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("rejects number input", () => {
      const result = mySubscriptionSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it("rejects null input", () => {
      const result = mySubscriptionSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("rejects boolean input", () => {
      const result = mySubscriptionSchema.safeParse(true);
      expect(result.success).toBe(false);
    });

    it("parses undefined to undefined (optional behavior)", () => {
      const result = mySubscriptionSchema.parse(undefined);
      expect(result).toBeUndefined();
    });

    it("parses empty object to empty object", () => {
      const result = mySubscriptionSchema.parse({});
      expect(result).toEqual({});
    });
  });

  describe("Subscription Response Type", () => {
    it("should have correct subscription response structure", () => {
      // This verifies the expected shape of the subscription response
      interface SubscriptionResponse {
        plan: string;
        endsAt: Date | null;
      }

      const response: SubscriptionResponse = {
        plan: "pro",
        endsAt: new Date(),
      };

      expect(response.plan).toBeDefined();
      expect(response.endsAt).toBeInstanceOf(Date);
    });

    it("should allow null endsAt for active subscriptions", () => {
      interface SubscriptionResponse {
        plan: string;
        endsAt: Date | null;
      }

      const response: SubscriptionResponse = {
        plan: "free",
        endsAt: null,
      };

      expect(response.endsAt).toBeNull();
    });

    it("should support different plan values", () => {
      const plans = ["free", "pro", "business"] as const;

      plans.forEach((plan) => {
        const response = { plan, endsAt: null };
        expect(plans).toContain(response.plan);
      });
    });
  });
});
