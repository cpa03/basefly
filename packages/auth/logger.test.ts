import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as Common from "@saasfly/common";

const mockPino = vi.hoisted(() => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@saasfly/common", async (importOriginal) => {
  const actual = await importOriginal<typeof Common>();
  return {
    ...actual,
    authLogger: mockPino,
  };
});

const { logger } = await import("./logger");

describe("auth logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("delegation", () => {
    it("logs an info message with metadata", () => {
      logger.info("User signed in", { userId: "user_123" });

      expect(mockPino.info).toHaveBeenCalledWith(
        { userId: "user_123" },
        "User signed in",
      );
    });

    it("logs an info message without metadata", () => {
      logger.info("Starting auth");

      expect(mockPino.info).toHaveBeenCalledWith({}, "Starting auth");
    });

    it("logs a warning message with metadata", () => {
      logger.warn("Slow login detected", { duration: 2500 });

      expect(mockPino.warn).toHaveBeenCalledWith(
        { duration: 2500 },
        "Slow login detected",
      );
    });

    it("logs a debug message with metadata", () => {
      logger.debug("Resolving identity", { provider: "clerk" });

      expect(mockPino.debug).toHaveBeenCalledWith(
        { provider: "clerk" },
        "Resolving identity",
      );
    });

    it("passes the error object through on error", () => {
      const error = new Error("clerk request failed");
      logger.error("Auth failed", error, { userId: "user_123" });

      const [emitted, message] = mockPino.error.mock.calls[0] as [
        Record<string, unknown>,
        string,
      ];
      expect(emitted.error).toBe(error);
      expect(emitted.userId).toBe("user_123");
      expect(message).toBe("Auth failed");
    });
  });

  describe("sensitive data redaction", () => {
    it("redacts API keys and authorization headers", () => {
      logger.warn("Auth attempt", {
        requestId: "req-1",
        API_KEY: "sk_live_leak_test",
        Authorization: "Bearer super-secret-token",
      });

      const emitted = mockPino.warn.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(emitted.API_KEY).toBe("[REDACTED]");
      expect(emitted.Authorization).toBe("[REDACTED]");
      expect(emitted.requestId).toBe("req-1");
    });

    it("redacts secrets, tokens, and signatures", () => {
      logger.debug("Resolving identity", {
        secret: "super-secret",
        token: "tok_abcdef",
        signature: "whsec_signature",
        apiKey: "sk_test_key",
      });

      const emitted = mockPino.debug.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(emitted.secret).toBe("[REDACTED]");
      expect(emitted.token).toBe("[REDACTED]");
      expect(emitted.signature).toBe("[REDACTED]");
      expect(emitted.apiKey).toBe("[REDACTED]");
    });

    it("redacts header-like fields that may carry webhook secrets", () => {
      logger.info("Webhook received", { stripeSignature: "whsec_123" });

      const emitted = mockPino.info.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(emitted.stripeSignature).toBe("[REDACTED]");
    });

    it("keeps non-sensitive metadata intact", () => {
      logger.info("User profile loaded", {
        userId: "user_1",
        email: "user@example.com",
        status: "active",
      });

      expect(mockPino.info).toHaveBeenCalledWith(
        {
          userId: "user_1",
          email: "user@example.com",
          status: "active",
        },
        "User profile loaded",
      );
    });

    it("does not mutate the caller's metadata object", () => {
      const metadata = { sessionToken: "sess_abc" };
      logger.info("Resolving session", metadata);

      expect(metadata.sessionToken).toBe("sess_abc");
      const emitted = mockPino.info.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(emitted.sessionToken).toBe("[REDACTED]");
    });
  });
});
