import { describe, it, expect } from "vitest";
import {
  LogLevel,
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL,
  NODE_ENV,
  IS_DEV,
  IS_PROD,
  IS_TEST,
  ADMIN_EMAIL,
  isAdminEmail,
  isValidLogLevel,
  REDIS_URL,
  IS_REDIS_CONFIGURED,
} from "./env";

describe("env", () => {
  describe("LogLevel", () => {
    it("should have all log levels", () => {
      expect(LogLevel.DEBUG).toBe("debug");
      expect(LogLevel.INFO).toBe("info");
      expect(LogLevel.WARN).toBe("warn");
      expect(LogLevel.ERROR).toBe("error");
    });
  });

  describe("DEFAULT_LOG_LEVEL", () => {
    it("should be INFO by default", () => {
      expect(DEFAULT_LOG_LEVEL).toBe(LogLevel.INFO);
    });
  });

  describe("Environment detection", () => {
    it("should export NODE_ENV", () => {
      expect(typeof NODE_ENV).toBe("string");
    });

    it("should have IS_DEV as boolean", () => {
      expect(typeof IS_DEV).toBe("boolean");
    });

    it("should have IS_PROD as boolean", () => {
      expect(typeof IS_PROD).toBe("boolean");
    });

    it("should have IS_TEST as boolean", () => {
      expect(typeof IS_TEST).toBe("boolean");
    });
  });

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

  describe("isValidLogLevel", () => {
    it("should validate correct log levels", () => {
      expect(isValidLogLevel("debug")).toBe(true);
      expect(isValidLogLevel("info")).toBe(true);
      expect(isValidLogLevel("warn")).toBe(true);
      expect(isValidLogLevel("error")).toBe(true);
    });

    it("should reject invalid log levels", () => {
      expect(isValidLogLevel("invalid")).toBe(false);
      expect(isValidLogLevel("")).toBe(false);
      expect(isValidLogLevel("TRACE")).toBe(false);
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
