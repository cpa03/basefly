/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  enhancedK8sClusterCreateSchema,
  enhancedK8sClusterDeleteSchema,
  enhancedK8sClusterUpdateSchema,
  enhancedStripeCreateSessionSchema,
  enhancedUpdateUserNameSchema,
  enhancedInsertCustomerSchema,
  enhancedQueryCustomerSchema,
} from "./schemas";

describe("Enhanced API Schemas Validation", () => {
  describe("enhancedK8sClusterCreateSchema", () => {
    it("accepts valid cluster creation data", () => {
      const validData = {
        name: "test-cluster",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts cluster name with hyphens and numbers", () => {
      const validData = {
        name: "prod-cluster-2024",
        location: "eu-west-2",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("trims whitespace from name", () => {
      const data = {
        name: "  test-cluster  ",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("test-cluster");
      }
    });

    it("trims whitespace from location", () => {
      const data = {
        name: "test-cluster",
        location: "  us-east-1  ",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.location).toBe("us-east-1");
      }
    });

    it("rejects empty cluster name", () => {
      const invalidData = {
        name: "",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("cannot be empty"))).toBe(
          true,
        );
      }
    });

    it("rejects whitespace-only cluster name", () => {
      const invalidData = {
        name: "   ",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects cluster name exceeding 100 characters", () => {
      const invalidData = {
        name: "a".repeat(101),
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("exceed 100"))).toBe(
          true,
        );
      }
    });

    it("rejects cluster name with special characters", () => {
      const invalidData = {
        name: "test_cluster!",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("only contain"))).toBe(
          true,
        );
      }
    });

    it("rejects cluster name with underscores", () => {
      const invalidData = {
        name: "test_cluster",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("only contain"))).toBe(
          true,
        );
      }
    });

    it("rejects cluster name with spaces", () => {
      const invalidData = {
        name: "test cluster",
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects location exceeding 50 characters", () => {
      const invalidData = {
        name: "test-cluster",
        location: "a".repeat(51),
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("exceed 50"))).toBe(
          true,
        );
      }
    });

    it("rejects empty location", () => {
      const invalidData = {
        name: "test-cluster",
        location: "",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = {
        name: "test-cluster",
        location: "us-east-1",
        network: "Default",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("unrecognized_keys");
      }
    });

    it("rejects non-string name", () => {
      const invalidData = {
        name: 123,
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects null values", () => {
      const invalidData = {
        name: null,
        location: "us-east-1",
      };
      const result = enhancedK8sClusterCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enhancedK8sClusterDeleteSchema", () => {
    it("accepts positive integer id", () => {
      const validData = { id: 1 };
      const result = enhancedK8sClusterDeleteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts large positive id", () => {
      const validData = { id: 999999 };
      const result = enhancedK8sClusterDeleteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects zero id", () => {
      const invalidData = { id: 0 };
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("positive");
      }
    });

    it("rejects negative id", () => {
      const invalidData = { id: -1 };
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("positive");
      }
    });

    it("rejects decimal id", () => {
      const invalidData = { id: 1.5 };
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("integer");
      }
    });

    it("rejects string id", () => {
      const invalidData = { id: "1" };
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects missing id", () => {
      const invalidData = {};
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = { id: 1, extra: "field" };
      const result = enhancedK8sClusterDeleteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enhancedK8sClusterUpdateSchema", () => {
    it("accepts valid update with name only", () => {
      const validData = {
        id: 1,
        name: "updated-cluster",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts valid update with location only", () => {
      const validData = {
        id: 1,
        location: "eu-west-1",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts valid update with both name and location", () => {
      const validData = {
        id: 1,
        name: "updated-cluster",
        location: "eu-west-1",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects update with neither name nor location", () => {
      const invalidData = {
        id: 1,
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("At least one field");
      }
    });

    it("applies same validation rules for name as create schema", () => {
      const invalidData = {
        id: 1,
        name: "invalid_name!",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("applies same validation rules for location as create schema", () => {
      const invalidData = {
        id: 1,
        location: "",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("trims whitespace from name when updating", () => {
      const data = {
        id: 1,
        name: "  updated-cluster  ",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("updated-cluster");
      }
    });

    it("trims whitespace from location when updating", () => {
      const data = {
        id: 1,
        location: "  eu-west-1  ",
      };
      const result = enhancedK8sClusterUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.location).toBe("eu-west-1");
      }
    });
  });

  describe("enhancedStripeCreateSessionSchema", () => {
    it("accepts valid Stripe price ID", () => {
      const validData = { planId: "price_123abc456def" };
      const result = enhancedStripeCreateSessionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts Stripe price ID with UUID suffix", () => {
      const validData = { planId: "price_550e8400-e29b-41d4-a716-446655440000" };
      const result = enhancedStripeCreateSessionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects planId without price_ prefix", () => {
      const invalidData = { planId: "prod_123abc" };
      const result = enhancedStripeCreateSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("start with 'price_'");
      }
    });

    it("rejects empty planId", () => {
      const invalidData = { planId: "" };
      const result = enhancedStripeCreateSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("cannot be empty");
      }
    });

    it("rejects null planId", () => {
      const invalidData = { planId: null };
      const result = enhancedStripeCreateSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = { planId: "price_123", quantity: 2 };
      const result = enhancedStripeCreateSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enhancedUpdateUserNameSchema", () => {
    it("accepts valid user name", () => {
      const validData = {
        name: "John Doe",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts name with accents", () => {
      const validData = {
        name: "José María",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("trims whitespace from name", () => {
      const data = {
        name: "  John Doe  ",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
      }
    });

    it("rejects empty name", () => {
      const invalidData = {
        name: "",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("cannot be empty");
      }
    });

    it("rejects whitespace-only name", () => {
      const invalidData = {
        name: "   ",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects name exceeding 100 characters", () => {
      const invalidData = {
        name: "a".repeat(101),
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("exceed 100");
      }
    });

    it("rejects invalid UUID format", () => {
      const invalidData = {
        name: "John Doe",
        userId: "not-a-uuid",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("Invalid user ID"))).toBe(
          true,
        );
      }
    });

    it("rejects UUID without dashes", () => {
      const invalidData = {
        name: "John Doe",
        userId: "550e8400e29b41d4a716446655440000",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects UUID with invalid characters", () => {
      const invalidData = {
        name: "John Doe",
        userId: "550e8400-e29b-41d4-a716-44665544000g",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects missing userId", () => {
      const invalidData = {
        name: "John Doe",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = {
        name: "John Doe",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        email: "john@example.com",
      };
      const result = enhancedUpdateUserNameSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enhancedInsertCustomerSchema", () => {
    it("accepts valid UUID", () => {
      const validData = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedInsertCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts nil UUID", () => {
      const validData = {
        userId: "00000000-0000-0000-0000-000000000000",
      };
      const result = enhancedInsertCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects non-UUID string", () => {
      const invalidData = {
        userId: "user-123",
      };
      const result = enhancedInsertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Invalid user ID");
      }
    });

    it("rejects empty string", () => {
      const invalidData = {
        userId: "",
      };
      const result = enhancedInsertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects null userId", () => {
      const invalidData = {
        userId: null,
      };
      const result = enhancedInsertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        plan: "PRO",
      };
      const result = enhancedInsertCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("enhancedQueryCustomerSchema", () => {
    it("accepts valid UUID", () => {
      const validData = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = enhancedQueryCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID", () => {
      const invalidData = {
        userId: "not-a-uuid",
      };
      const result = enhancedQueryCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects extra fields", () => {
      const invalidData = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        plan: "FREE",
      };
      const result = enhancedQueryCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Schema Security - Strict Mode", () => {
    it("enhancedK8sClusterCreateSchema rejects unknown properties", () => {
      const result = enhancedK8sClusterCreateSchema.safeParse({
        name: "test",
        location: "us-east-1",
        unknownField: "exploit",
      });
      expect(result.success).toBe(false);
    });

    it("enhancedK8sClusterDeleteSchema rejects unknown properties", () => {
      const result = enhancedK8sClusterDeleteSchema.safeParse({
        id: 1,
        constructor: "exploit",
      });
      expect(result.success).toBe(false);
    });

    it("enhancedStripeCreateSessionSchema rejects unknown properties", () => {
      const result = enhancedStripeCreateSessionSchema.safeParse({
        planId: "price_123",
        amount: 99999,
      });
      expect(result.success).toBe(false);
    });
  });
});
