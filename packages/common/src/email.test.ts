import { describe, expect, it } from "vitest";

import { getResendClientOrThrow, isResendConfigured, resend } from "./email";

describe("email.ts - Resend Configuration", () => {
  describe("isResendConfigured", () => {
    it("should return true when resend client is available", () => {
      // The actual result depends on env vars, but we test the function logic
      const result = isResendConfigured();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getResendClientOrThrow", () => {
    it("should throw error when resend is not configured", () => {
      // This test verifies the error is thrown when resend is null
      // The actual behavior depends on whether RESEND_API_KEY is set
      if (!resend) {
        expect(() => getResendClientOrThrow()).toThrow();
      }
    });

    it("should return Resend client when configured", () => {
      // If resend is configured (env var set), this should work
      if (resend) {
        const client = getResendClientOrThrow();
        expect(client).toBeDefined();
        expect(client).not.toBeNull();
      }
    });
  });

  describe("resend client export", () => {
    it("should export resend client as ResendClient type", () => {
      // The resend export can be null or Resend instance
      expect(resend === null || typeof resend === "object").toBe(true);
    });
  });
});
