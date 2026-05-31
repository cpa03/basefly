import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isClerkEnabled } from "./clerk";
import { authOptions } from "./index";
import { logger } from "./logger";

describe("Auth Module", () => {
  describe("clerk.ts - isClerkEnabled", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return false when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set", () => {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when clerk key contains 'dummy'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_dummy";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when clerk key contains 'placeholder'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder_key";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when clerk key does not start with 'pk_'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "sk_test_key123";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when clerk key is too short", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_abc";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return true with valid clerk publishable key", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51ExampleValidKey12345678901234567890";
      expect(isClerkEnabled()).toBe(true);
    });

    it("should return true with production clerk key", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_live_51ExampleValidKey12345678901234567890";
      expect(isClerkEnabled()).toBe(true);
    });
  });

  describe("logger.ts", () => {
    it("should have debug method", () => {
      expect(typeof logger.debug).toBe("function");
    });

    it("should have info method", () => {
      expect(typeof logger.info).toBe("function");
    });

    it("should have warn method", () => {
      expect(typeof logger.warn).toBe("function");
    });

    it("should have error method", () => {
      expect(typeof logger.error).toBe("function");
    });

    it("should log debug messages without throwing", () => {
      expect(() => logger.debug("test debug message")).not.toThrow();
    });

    it("should log info messages without throwing", () => {
      expect(() => logger.info("test info message")).not.toThrow();
    });

    it("should log warn messages without throwing", () => {
      expect(() => logger.warn("test warn message")).not.toThrow();
    });

    it("should log error messages without throwing", () => {
      expect(() => logger.error("test error message")).not.toThrow();
    });

    it("should log error with error object without throwing", () => {
      const error = new Error("test error");
      expect(() => logger.error("test error with object", error)).not.toThrow();
    });

    it("should log with metadata without throwing", () => {
      const metadata = { userId: "123", action: "test" };
      expect(() => logger.info("test with metadata", metadata)).not.toThrow();
    });

    it("should log error with metadata without throwing", () => {
      const error = new Error("test error");
      const metadata = { userId: "123", action: "test" };
      expect(() =>
        logger.error("test error with metadata", error, metadata),
      ).not.toThrow();
    });
  });

  describe("index.ts - authOptions", () => {
    it("should have pages configuration", () => {
      expect(authOptions).toHaveProperty("pages");
    });

    it("should have signIn page configured", () => {
      expect(authOptions.pages).toHaveProperty("signIn");
      expect(authOptions.pages.signIn).toBe("/login");
    });
  });
});
