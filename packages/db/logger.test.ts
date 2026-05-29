import { beforeEach, describe, expect, it, vi } from "vitest";

const mockInfo = vi.hoisted(() => vi.fn());
const mockWarn = vi.hoisted(() => vi.fn());
const mockError = vi.hoisted(() => vi.fn());

vi.mock("@saasfly/common", () => ({
  dbLogger: {},
  createLoggerWrapper: vi.fn(() => ({
    info: mockInfo,
    warn: mockWarn,
    error: mockError,
  })),
}));

const { logger } = await import("./logger");

describe("db logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("info", () => {
    it("logs an info message with metadata", () => {
      logger.info("Database connected", { host: "localhost", port: 5432 });

      expect(mockInfo).toHaveBeenCalledWith("Database connected", {
        host: "localhost",
        port: 5432,
      });
    });

    it("logs an info message without metadata", () => {
      logger.info("Starting migration");

      expect(mockInfo).toHaveBeenCalledWith("Starting migration", undefined);
    });

    it("passes through empty metadata object", () => {
      logger.info("Operation completed", {});

      expect(mockInfo).toHaveBeenCalledWith("Operation completed", {});
    });
  });

  describe("warn", () => {
    it("logs a warning message with metadata", () => {
      logger.warn("Slow query detected", {
        query: "SELECT * FROM users",
        duration: 2500,
      });

      expect(mockWarn).toHaveBeenCalledWith("Slow query detected", {
        query: "SELECT * FROM users",
        duration: 2500,
      });
    });

    it("logs a warning message without metadata", () => {
      logger.warn("Connection pool nearing limit");

      expect(mockWarn).toHaveBeenCalledWith(
        "Connection pool nearing limit",
        undefined,
      );
    });
  });

  describe("error", () => {
    it("logs an error message with error object and metadata", () => {
      const error = new Error("Query failed");
      logger.error("Database query error", error, { sql: "SELECT *" });

      expect(mockError).toHaveBeenCalledWith("Database query error", error, {
        sql: "SELECT *",
      });
    });

    it("logs an error message with error object only", () => {
      const error = new Error("Connection timeout");
      logger.error("Connection failed", error);

      expect(mockError).toHaveBeenCalledWith(
        "Connection failed",
        error,
        undefined,
      );
    });

    it("logs an error message without error or metadata", () => {
      logger.error("Unknown database error");

      expect(mockError).toHaveBeenCalledWith(
        "Unknown database error",
        undefined,
        undefined,
      );
    });
  });
});
