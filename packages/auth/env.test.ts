import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for packages/auth/env.mjs — the environment schema that guards
 * Stripe/Resend secrets and public app configuration at module load.
 *
 * `@t3-oss/env-core` only validates server variables when it detects a server
 * context (`typeof window === "undefined"`). vitest's happy-dom environment
 * defines `window`, so server validation is exercised by stubbing the global
 * `window` to `undefined` (which makes `@t3-oss` treat the context as server).
 * Client-context behavior (validation of `NEXT_PUBLIC_*` vars and the
 * server-secret access guard) is tested under the default happy-dom env.
 */

const originalEnv = process.env;

function setRequiredServerVars(): void {
  process.env.STRIPE_API_KEY = "sk_test_123";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
  process.env.RESEND_API_KEY = "re_123";
  process.env.RESEND_FROM = "test@basefly.io";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
}

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
  vi.unstubAllGlobals();
});

describe("packages/auth env.mjs", () => {
  describe("server context (server-side validation)", () => {
    beforeEach(() => {
      // Simulate a server context so @t3-oss validates server variables
      vi.stubGlobal("window", undefined);
    });

    it("parses a fully-populated environment", async () => {
      setRequiredServerVars();

      const { env } = await import("./env.mjs");

      expect(env.STRIPE_API_KEY).toBe("sk_test_123");
      expect(env.STRIPE_WEBHOOK_SECRET).toBe("whsec_123");
      expect(env.RESEND_API_KEY).toBe("re_123");
      expect(env.RESEND_FROM).toBe("test@basefly.io");
      expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    });

    it.each([
      "STRIPE_API_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "RESEND_API_KEY",
      "RESEND_FROM",
      "NEXT_PUBLIC_APP_URL",
    ])("throws when required var %s is missing", async (missingVar) => {
      setRequiredServerVars();
      delete process.env[missingVar];

      await expect(import("./env.mjs")).rejects.toThrow();
    });

    it("throws when a required var is an empty string (min(1))", async () => {
      setRequiredServerVars();
      process.env.STRIPE_API_KEY = "";

      await expect(import("./env.mjs")).rejects.toThrow();
    });

    it("allows optional vars to be absent", async () => {
      setRequiredServerVars();
      delete process.env.ADMIN_EMAIL;
      delete process.env.IS_DEBUG;
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

      const { env } = await import("./env.mjs");

      expect(env.STRIPE_API_KEY).toBe("sk_test_123");
      expect(env.ADMIN_EMAIL).toBeUndefined();
      expect(env.IS_DEBUG).toBeUndefined();
      expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeUndefined();
    });
  });

  describe("client context (happy-dom)", () => {
    it("throws when NEXT_PUBLIC_APP_URL is missing", async () => {
      process.env.STRIPE_API_KEY = "sk_test_123";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
      process.env.RESEND_API_KEY = "re_123";
      process.env.RESEND_FROM = "test@basefly.io";

      await expect(import("./env.mjs")).rejects.toThrow();
    });

    it("parses client variables when fully populated", async () => {
      setRequiredServerVars();
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validKey1234567890";

      const { env } = await import("./env.mjs");

      expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
      expect(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe(
        "pk_test_validKey1234567890",
      );
    });

    it("does not expose server variables on the client", async () => {
      setRequiredServerVars();

      const { env } = await import("./env.mjs");

      // @t3-oss proxies server keys and throws on client access
      expect(() => env.STRIPE_API_KEY).toThrow();
    });
  });
});
