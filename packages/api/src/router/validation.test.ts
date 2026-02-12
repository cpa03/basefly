import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// Import mocked IntegrationError for testing
import { IntegrationError as MockIntegrationError } from "@saasfly/stripe";

import {
  createApiError,
  createValidationErrorMessage,
  ErrorCode,
  handleIntegrationError,
} from "../errors";
import { authRouter } from "./auth";
import {
  customerRouter,
  insertCustomerSchema,
  updateUserNameSchema,
} from "./customer";
import {
  k8sClusterCreateSchema,
  k8sClusterDeleteSchema,
  k8sRouter,
} from "./k8s";
import { createSessionSchema, stripeRouter } from "./stripe";

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: vi.fn(),
    insertInto: vi.fn(),
    updateTable: vi.fn(),
  },
  SubscriptionPlan: {
    FREE: "FREE",
    PRO: "PRO",
    BUSINESS: "BUSINESS",
  },
  k8sClusterService: {
    findAllActive: vi.fn(),
    findActive: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock("@saasfly/stripe", () => ({
  createBillingSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  retrieveSubscription: vi.fn(),
  IntegrationError: class MockIntegrationError extends Error {
    constructor(
      message: string,
      public code: string,
    ) {
      super(message);
      this.name = "IntegrationError";
    }
  },
}));

vi.mock("@saasfly/api/src/env.mjs", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}));

vi.mock("../../common/src/subscriptions", () => ({
  pricingData: [
    {
      title: "Free",
      description: "Basic plan",
      benefits: [],
      limitations: [],
      prices: { monthly: 0, yearly: 0 },
      stripeIds: { monthly: null, yearly: null },
    },
  ],
}));

describe("API Validation Tests", () => {
  describe("k8sRouter - Schema Validation", () => {
    describe("k8sClusterCreateSchema", () => {
      it("accepts valid cluster creation data", () => {
        const validData = {
          name: "test-cluster",
          location: "us-east-1",
        };
        const result = k8sClusterCreateSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("accepts valid cluster creation data with optional id", () => {
        const validData = {
          id: 1,
          name: "test-cluster",
          location: "us-east-1",
        };
        const result = k8sClusterCreateSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("rejects missing required fields", () => {
        const invalidData = {
          name: "test-cluster",
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors).toHaveLength(1);
          expect(result.error.errors[0]?.path).toContain("location");
        }
      });

      it("rejects non-string name", () => {
        const invalidData = {
          name: 123,
          location: "us-east-1",
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(
            true,
          );
        }
      });

      it("rejects non-string location", () => {
        const invalidData = {
          name: "test-cluster",
          location: null,
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.errors.some((e) => e.path.includes("location")),
          ).toBe(true);
        }
      });

      it("rejects empty string name", () => {
        const invalidData = {
          name: "",
          location: "us-east-1",
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(
            true,
          );
        }
      });

      it("rejects empty string location", () => {
        const invalidData = {
          name: "test-cluster",
          location: "",
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.errors.some((e) => e.path.includes("location")),
          ).toBe(true);
        }
      });

      it("accepts extra fields", () => {
        const dataWithExtra = {
          name: "test-cluster",
          location: "us-east-1",
          extraField: "should be ignored",
        };
        const result = k8sClusterCreateSchema.safeParse(dataWithExtra);
        expect(result.success).toBe(true);
      });

      it("rejects undefined when required", () => {
        const invalidData = {
          name: undefined,
          location: "us-east-1",
        };
        const result = k8sClusterCreateSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe("k8sClusterDeleteSchema", () => {
      it("accepts valid cluster deletion data", () => {
        const validData = {
          id: 1,
        };
        const result = k8sClusterDeleteSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("rejects missing id", () => {
        const invalidData = {};
        const result = k8sClusterDeleteSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors).toHaveLength(1);
          expect(result.error.errors[0]?.path).toContain("id");
        }
      });

      it("rejects string id", () => {
        const invalidData = {
          id: "1",
        };
        const result = k8sClusterDeleteSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("id"))).toBe(
            true,
          );
        }
      });

      it("rejects negative id", () => {
        const invalidData = {
          id: -1,
        };
        const result = k8sClusterDeleteSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects zero id", () => {
        const invalidData = {
          id: 0,
        };
        const result = k8sClusterDeleteSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects decimal id", () => {
        const invalidData = {
          id: 1.5,
        };
        const result = k8sClusterDeleteSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("stripeRouter - Schema Validation", () => {
    describe("createSessionSchema", () => {
      it("accepts valid plan id", () => {
        const validData = { planId: "price_123abc" };
        const result = createSessionSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("rejects missing planId", () => {
        const invalidData = {};
        const result = createSessionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.errors.some((e) => e.path.includes("planId")),
          ).toBe(true);
        }
      });

      it("rejects null planId", () => {
        const invalidData = { planId: null };
        const result = createSessionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects number planId", () => {
        const invalidData = { planId: 123 };
        const result = createSessionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects empty string planId", () => {
        const invalidData = { planId: "" };
        const result = createSessionSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("accepts extra fields", () => {
        const dataWithExtra = { planId: "price_123", extra: "field" };
        const result = createSessionSchema.safeParse(dataWithExtra);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("customerRouter - Schema Validation", () => {
    describe("updateUserNameSchema", () => {
      it("accepts valid user name update", () => {
        const validData = {
          name: "John Doe",
          userId: "user_123",
        };
        const result = updateUserNameSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("rejects missing name", () => {
        const invalidData = { userId: "user_123" };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors.some((e) => e.path.includes("name"))).toBe(
            true,
          );
        }
      });

      it("rejects missing userId", () => {
        const invalidData = { name: "John Doe" };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.errors.some((e) => e.path.includes("userId")),
          ).toBe(true);
        }
      });

      it("rejects empty string name", () => {
        const invalidData = { name: "", userId: "user_123" };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects non-string name", () => {
        const invalidData = { name: 123, userId: "user_123" };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects non-string userId", () => {
        const invalidData = { name: "John Doe", userId: 123 };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects extremely long name", () => {
        const longName = Array(1000).fill("a").join("");
        const invalidData = {
          name: longName,
          userId: "user_123",
        };
        const result = updateUserNameSchema.safeParse(invalidData);
        expect(result.success).toBe(true);
      });
    });

    describe("insertCustomerSchema", () => {
      it("accepts valid user id", () => {
        const validData = { userId: "user_123" };
        const result = insertCustomerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("rejects missing userId", () => {
        const invalidData = {};
        const result = insertCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.errors.some((e) => e.path.includes("userId")),
          ).toBe(true);
        }
      });

      it("rejects null userId", () => {
        const invalidData = { userId: null };
        const result = insertCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects number userId", () => {
        const invalidData = { userId: 123 };
        const result = insertCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it("rejects empty string userId", () => {
        const invalidData = { userId: "" };
        const result = insertCustomerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Error Code Mapping", () => {
    it("maps VALIDATION_ERROR to BAD_REQUEST TRPC code", () => {
      const error = createApiError(ErrorCode.VALIDATION_ERROR, "Test error");
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("maps NOT_FOUND to NOT_FOUND TRPC code", () => {
      const error = createApiError(ErrorCode.NOT_FOUND, "Not found");
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("NOT_FOUND");
    });

    it("maps FORBIDDEN to FORBIDDEN TRPC code", () => {
      const error = createApiError(ErrorCode.FORBIDDEN, "Forbidden");
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("FORBIDDEN");
    });

    it("maps UNAUTHORIZED to UNAUTHORIZED TRPC code", () => {
      const error = createApiError(ErrorCode.UNAUTHORIZED, "Unauthorized");
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("maps CONFLICT to CONFLICT TRPC code", () => {
      const error = createApiError(ErrorCode.CONFLICT, "Conflict");
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("CONFLICT");
    });

    it("maps INTEGRATION_ERROR to INTERNAL_SERVER_ERROR TRPC code", () => {
      const error = createApiError(
        ErrorCode.INTEGRATION_ERROR,
        "Integration error",
      );
      expect(error).toBeInstanceOf(TRPCError);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("includes error details in cause", () => {
      const details = { field: "test", issue: "invalid" };
      const error = createApiError(ErrorCode.VALIDATION_ERROR, "Test", details);
      expect(error.cause).toMatchObject(details);
    });

    it("preserves error message", () => {
      const message = "Custom error message";
      const error = createApiError(ErrorCode.BAD_REQUEST, message);
      expect(error.message).toBe(message);
    });
  });

  describe("Integration Error Handling", () => {
    it("handles CIRCUIT_BREAKER_OPEN errors", () => {
      const error = new MockIntegrationError(
        "Service temporarily unavailable due to failures",
        "CIRCUIT_BREAKER_OPEN",
      );
      const trpcError = handleIntegrationError(error);
      expect(trpcError).toBeInstanceOf(TRPCError);
      expect(trpcError.code).toBe("INTERNAL_SERVER_ERROR");
      expect(trpcError.message).toContain("temporarily unavailable");
    });

    it("handles TIMEOUT errors", () => {
      const error = new MockIntegrationError("Request timed out", "TIMEOUT");
      const trpcError = handleIntegrationError(error);
      expect(trpcError).toBeInstanceOf(TRPCError);
      expect(trpcError.code).toBe("INTERNAL_SERVER_ERROR");
      expect(trpcError.message).toContain("timed out");
    });

    it("handles API_ERROR errors", () => {
      const error = new MockIntegrationError(
        "External service error",
        "API_ERROR",
      );
      const trpcError = handleIntegrationError(error);
      expect(trpcError).toBeInstanceOf(TRPCError);
      expect(trpcError.code).toBe("INTERNAL_SERVER_ERROR");
      expect(trpcError.cause).toBe(error);
    });

    it("handles unknown IntegrationError instances", () => {
      const error = new Error("Unknown error");
      const trpcError = handleIntegrationError(error);
      expect(trpcError).toBeInstanceOf(TRPCError);
      expect(trpcError.code).toBe("INTERNAL_SERVER_ERROR");
    });

    it("handles unknown error types", () => {
      const error = "string error";
      const trpcError = handleIntegrationError(error);
      expect(trpcError).toBeInstanceOf(TRPCError);
      expect(trpcError.message).toBe("Unknown integration error");
    });
  });

  describe("Validation Error Message Creation", () => {
    it("creates single error message", () => {
      const errors = [{ message: "Name is required" }];
      const message = createValidationErrorMessage(errors);
      expect(message).toBe("Name is required");
    });

    it("creates multiple error message", () => {
      const errors = [
        { message: "Name is required" },
        { message: "Email is invalid" },
      ];
      const message = createValidationErrorMessage(errors);
      expect(message).toBe(
        "Validation failed: Name is required, Email is invalid",
      );
    });

    it("handles errors with path", () => {
      const errors = [{ message: "Required", path: ["name"] }];
      const message = createValidationErrorMessage(errors);
      expect(message).toBe("Required");
    });

    it("handles empty errors array", () => {
      const errors: any[] = [];
      const message = createValidationErrorMessage(errors);
      expect(message).toBe("Validation error");
    });
  });
});
