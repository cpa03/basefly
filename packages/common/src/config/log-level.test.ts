import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOG_LEVEL,
  IS_DEV,
  IS_PROD,
  IS_TEST,
  isValidLogLevel,
  LogLevel,
  NODE_ENV,
} from "./log-level";

describe("log-level", () => {
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
});
