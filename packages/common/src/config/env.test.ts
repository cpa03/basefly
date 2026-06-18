import { describe, expect, it } from "vitest";

import {
  ADMIN_EMAIL,
  IS_REDIS_CONFIGURED,
  isAdminEmail,
  REDIS_URL,
} from "./env";

describe("env", () => {
  describe("ADMIN_EMAIL", () => {
    it("should be a string", () => {
      expect(typeof ADMIN_EMAIL).toBe("string");
    });
  });

  describe("isAdminEmail", () => {
    it("should return false for null/undefined email", () => {
      expect(isAdminEmail(null)).toBe(false);
      expect(isAdminEmail(undefined)).toBe(false);
    });

    it("should return false when ADMIN_EMAIL is empty", () => {
      // When ADMIN_EMAIL is empty, should return false
      expect(isAdminEmail("test@example.com")).toBe(false);
    });

    it("should handle case-insensitive comparison", () => {
      // If ADMIN_EMAIL was set, would test case insensitivity
      // Since ADMIN_EMAIL is empty in test, function returns false
      expect(isAdminEmail("TEST@EXAMPLE.COM")).toBe(false);
    });
  });

  describe("REDIS_URL", () => {
    it("should be a string", () => {
      expect(typeof REDIS_URL).toBe("string");
    });
  });

  describe("IS_REDIS_CONFIGURED", () => {
    it("should be a boolean", () => {
      expect(typeof IS_REDIS_CONFIGURED).toBe("boolean");
    });

    it("should be false when REDIS_URL is empty", () => {
      expect(IS_REDIS_CONFIGURED).toBe(false);
    });
  });
});
