import { afterEach, describe, expect, it, vi } from "vitest";
import { createLoggerWrapper } from "@saasfly/common";

import type { Logger as PinoLogger } from "pino";

interface MockPinoLogger {
  debug: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
}

function createTestLogger(): {
  logger: ReturnType<typeof createLoggerWrapper>;
  mockPino: MockPinoLogger;
} {
  const mockPino: MockPinoLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  const logger = createLoggerWrapper(mockPino as unknown as PinoLogger);

  return { logger, mockPino };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logger sensitive data redaction", () => {
  it("should redact fields containing 'secret' in the key name", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("Test message", {
      requestId: "req-123",
      webhookSecret: "sk_live_abc123",
    });

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.webhookSecret).toBe("[REDACTED]");
    expect(callArg.requestId).toBe("req-123");
  });

  it("should redact fields containing 'token' in the key name", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("Test with token", {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      userId: "user_abc",
    });

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.accessToken).toBe("[REDACTED]");
    expect(callArg.userId).toBe("user_abc");
  });

  it("should redact fields containing 'password' in the key name", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("Test with password", {
      password: "super-secret-123",
      email: "test@example.com",
    });

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.password).toBe("[REDACTED]");
    expect(callArg.email).toBe("test@example.com");
  });

  it("should redact fields containing 'credential' in the key name", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("Test with credential", {
      credentials: JSON.stringify({ username: "admin", password: "hunter2" }),
    });

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.credentials).toBe("[REDACTED]");
  });

  it("should redact fields containing 'api_key' in the key name", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("Test with api_key", {
      api_key: "sk_live_xxxxyyyyzzzz",
      requestId: "req-456",
    });

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.api_key).toBe("[REDACTED]");
    expect(callArg.requestId).toBe("req-456");
  });

  it("should redact sensitive fields in error logs (always active)", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.error("Operation failed", new Error("DB timeout"), {
      requestId: "req-789",
      stripeSecretKey: "sk_live_yyyy",
    });

    expect(mockPino.error).toHaveBeenCalledTimes(1);
    const callArg = mockPino.error.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.stripeSecretKey).toBe("[REDACTED]");
    expect(callArg.requestId).toBe("req-789");
  });

  it("should not modify non-sensitive fields", async () => {
    const { logger, mockPino } = createTestLogger();

    const meta: Record<string, unknown> = {
      requestId: "req-111",
      userId: "user_xyz",
      eventType: "checkout.session.completed",
      duration: 150,
      status: "success",
    };

    logger.info("Non-sensitive data", meta);

    expect(mockPino.info).toHaveBeenCalledTimes(1);
    const callArg = mockPino.info.mock.calls[0][0] as Record<string, unknown>;
    expect(callArg.requestId).toBe("req-111");
    expect(callArg.userId).toBe("user_xyz");
    expect(callArg.eventType).toBe("checkout.session.completed");
    expect(callArg.duration).toBe(150);
    expect(callArg.status).toBe("success");
  });

  it("should handle undefined/empty meta gracefully", async () => {
    const { logger, mockPino } = createTestLogger();

    logger.info("No meta");
    logger.info("Empty meta", {});

    expect(mockPino.info).toHaveBeenCalledTimes(2);
    // First call: no meta - should pass empty object
    expect(mockPino.info.mock.calls[0][0]).toEqual({});
    // Second call: empty meta
    expect(mockPino.info.mock.calls[1][0]).toEqual({});
  });
});
