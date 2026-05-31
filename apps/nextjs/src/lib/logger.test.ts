/**
 * Tests for the app logger with sensitive data redaction.
 *
 * These tests verify that sensitive fields (secrets, tokens, passwords, etc.)
 * are automatically redacted before being written to the log output.
 */
import { type MockInstance, afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
  vi.restoreAllMocks();
});

/**
 * Parse the first argument of a console spy call as a typed log entry.
 * Uses unknown as intermediate type to satisfy strict type checking.
 */
interface LogEntry {
  level: string;
  msg: string;
  time: string;
  [key: string]: unknown;
}

function getLogArg(spy: MockInstance<(...args: unknown[]) => void>, callIndex = 0): LogEntry {
  const arg = spy.mock.calls[callIndex]?.[0];
  if (typeof arg !== "string") {
    throw new Error(`Expected string log argument at index ${callIndex}`);
  }
  return JSON.parse(arg) as LogEntry;
}

function noop(): void {
  /* noop - mock implementation for console spies */
}

/**
 * Helper to dynamically import the logger after resetting module cache.
 * This ensures isProduction is evaluated with the desired NODE_ENV.
 */
interface LoggerModule {
  logger: {
    debug: (msg: string, meta?: Record<string, unknown>) => void;
    info: (msg: string, meta?: Record<string, unknown>) => void;
    warn: (msg: string, meta?: Record<string, unknown>) => void;
    error: (
      msg: string,
      err?: unknown,
      meta?: Record<string, unknown>,
    ) => void;
  };
}

async function importLogger(env: string) {
  process.env.NODE_ENV = env;
  vi.resetModules();
  return vi.importActual<LoggerModule>("~/lib/logger");
}

describe("logger sensitive data redaction", () => {
  it("should redact fields containing 'secret' in the key name", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("Test message", {
      requestId: "req-123",
      webhookSecret: "sk_live_abc123",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.webhookSecret).toBe("[REDACTED]");
    expect(logArg.requestId).toBe("req-123");
  });

  it("should redact fields containing 'token' in the key name", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("Test with token", {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      userId: "user_abc",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.accessToken).toBe("[REDACTED]");
    expect(logArg.userId).toBe("user_abc");
  });

  it("should redact fields containing 'password' in the key name", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("Test with password", {
      password: "super-secret-123",
      email: "test@example.com",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.password).toBe("[REDACTED]");
    expect(logArg.email).toBe("test@example.com");
  });

  it("should redact fields containing 'credential' in the key name", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("Test with credential", {
      credentials: JSON.stringify({ username: "admin", password: "hunter2" }),
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.credentials).toBe("[REDACTED]");
  });

  it("should redact fields containing 'api_key' in the key name", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("Test with api_key", {
      api_key: "sk_live_xxxxyyyyzzzz",
      requestId: "req-456",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.api_key).toBe("[REDACTED]");
    expect(logArg.requestId).toBe("req-456");
  });

  it("should redact sensitive fields in error logs (always active)", async () => {
    const { logger } = await importLogger("production");
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(noop);

    logger.error("Operation failed", new Error("DB timeout"), {
      requestId: "req-789",
      stripeSecretKey: "sk_live_yyyy",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.stripeSecretKey).toBe("[REDACTED]");
    expect(logArg.requestId).toBe("req-789");
    expect(logArg.level).toBe("error");
  });

  it("should not modify non-sensitive fields", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    const meta: Record<string, unknown> = {
      requestId: "req-111",
      userId: "user_xyz",
      eventType: "checkout.session.completed",
      duration: 150,
      status: "success",
    };

    logger.info("Non-sensitive data", meta);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logArg = getLogArg(consoleSpy);
    expect(logArg.requestId).toBe("req-111");
    expect(logArg.userId).toBe("user_xyz");
    expect(logArg.eventType).toBe("checkout.session.completed");
    expect(logArg.duration).toBe(150);
    expect(logArg.status).toBe("success");
  });

  it("should handle undefined/empty meta gracefully", async () => {
    const { logger } = await importLogger("development");
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(noop);

    logger.info("No meta");
    logger.info("Empty meta", {});

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    const firstCall = getLogArg(consoleSpy, 0);
    expect(firstCall.msg).toBe("No meta");
    const secondCall = getLogArg(consoleSpy, 1);
    expect(secondCall.msg).toBe("Empty meta");
  });
});
