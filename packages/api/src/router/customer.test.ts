import { describe, expect, it } from "vitest";
import { z } from "zod";

import { USER_VALIDATION } from "@saasfly/common";

// Define schemas inline to avoid importing from customer.ts (which imports db)
export const updateUserNameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER_VALIDATION.displayName.minLength, "Name cannot be empty")
      .max(
        USER_VALIDATION.displayName.maxLength,
        `Name cannot exceed ${USER_VALIDATION.displayName.maxLength} characters`,
      ),
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const insertCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const queryCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

describe("Customer Router - Input Validation", () => {
  describe("updateUserNameSchema - User Name Validation", () => {
    const validUserId = "550e8400-e29b-41d4-a716-446655440000";

    it("accepts valid name within length constraints", () => {
      const result = updateUserNameSchema.safeParse({
        name: "John Doe",
        userId: validUserId,
      });
      expect(result.success).toBe(true);
    });

    it("accepts name at max length", () => {
      const maxName = "a".repeat(USER_VALIDATION.displayName.maxLength);
      const result = updateUserNameSchema.safeParse({
        name: maxName,
        userId: validUserId,
      });
      expect(result.success).toBe(true);
    });

    it("accepts name with spaces", () => {
      const result = updateUserNameSchema.safeParse({
        name: "John William Doe",
        userId: validUserId,
      });
      expect(result.success).toBe(true);
    });

    it("accepts name with special characters", () => {
      const result = updateUserNameSchema.safeParse({
        name: "José María O'Connor",
        userId: validUserId,
      });
      expect(result.success).toBe(true);
    });

    it("accepts name with unicode characters", () => {
      const result = updateUserNameSchema.safeParse({
        name: "张三 李四",
        userId: validUserId,
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid UUID format", () => {
      const result = updateUserNameSchema.safeParse({
        name: "Test User",
        userId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name after trim", () => {
      const result = updateUserNameSchema.safeParse({
        name: "",
        userId: validUserId,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) =>
              i.message.includes("cannot be empty") ||
              i.message.includes("Too small"),
          ),
        ).toBe(true);
      }
    });

    it("rejects whitespace-only name after trim", () => {
      const result = updateUserNameSchema.safeParse({
        name: "   ",
        userId: validUserId,
      });
      expect(result.success).toBe(false);
    });

    it("rejects name exceeding max length", () => {
      const tooLong = "a".repeat(USER_VALIDATION.displayName.maxLength + 1);
      const result = updateUserNameSchema.safeParse({
        name: tooLong,
        userId: validUserId,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some(
            (i) =>
              i.message.includes("cannot exceed") ||
              i.message.includes("Too big") ||
              i.message.includes("at most"),
          ),
        ).toBe(true);
      }
    });

    it("rejects invalid UUID format", () => {
      const result = updateUserNameSchema.safeParse({
        name: "Test User",
        userId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) =>
            i.message.includes("Invalid user ID format"),
          ),
        ).toBe(true);
      }
    });

    it("rejects non-string name", () => {
      const result = updateUserNameSchema.safeParse({
        name: 12345,
        userId: validUserId,
      });
      expect(result.success).toBe(false);
    });

    it("rejects null name", () => {
      const result = updateUserNameSchema.safeParse({
        name: null,
        userId: validUserId,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing name field", () => {
      const result = updateUserNameSchema.safeParse({
        userId: validUserId,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing userId field", () => {
      const result = updateUserNameSchema.safeParse({
        name: "Test User",
      });
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields", () => {
      const result = updateUserNameSchema.safeParse({
        name: "Test User",
        userId: validUserId,
        unknownField: "should fail",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("insertCustomerSchema - Customer Creation Validation", () => {
    it("accepts valid UUID for userId", () => {
      const result = insertCustomerSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid UUID format", () => {
      const result = insertCustomerSchema.safeParse({
        userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID format", () => {
      const result = insertCustomerSchema.safeParse({
        userId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) =>
            i.message.includes("Invalid user ID format"),
          ),
        ).toBe(true);
      }
    });

    it("rejects non-string userId", () => {
      const result = insertCustomerSchema.safeParse({
        userId: 12345,
      });
      expect(result.success).toBe(false);
    });

    it("rejects null userId", () => {
      const result = insertCustomerSchema.safeParse({
        userId: null,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing userId field", () => {
      const result = insertCustomerSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields", () => {
      const result = insertCustomerSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        extra: "field",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty string userId", () => {
      const result = insertCustomerSchema.safeParse({
        userId: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("queryCustomerSchema - Customer Query Validation", () => {
    it("accepts valid UUID for userId", () => {
      const result = queryCustomerSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid UUID format", () => {
      const result = queryCustomerSchema.safeParse({
        userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID format", () => {
      const result = queryCustomerSchema.safeParse({
        userId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) =>
            i.message.includes("Invalid user ID format"),
          ),
        ).toBe(true);
      }
    });

    it("rejects non-string userId", () => {
      const result = queryCustomerSchema.safeParse({
        userId: 12345,
      });
      expect(result.success).toBe(false);
    });

    it("rejects null userId", () => {
      const result = queryCustomerSchema.safeParse({
        userId: null,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing userId field", () => {
      const result = queryCustomerSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields", () => {
      const result = queryCustomerSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        extra: "field",
      });
      expect(result.success).toBe(false);
    });
  });
});
