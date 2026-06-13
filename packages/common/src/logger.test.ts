import { describe, expect, it } from "vitest";

import {
  apiLogger,
  authLogger,
  buildRedactConfig,
  createLogger,
  createLoggerWrapper,
  dbLogger,
  logger,
  stripeLogger,
  type BaseLogger,
  type LoggerConfig,
  type LogMetadata,
  type PackageName,
} from "./logger";

describe("logger.ts - createLogger", () => {
  it("should create a logger with default configuration", () => {
    const testLogger = createLogger({ package: "api" });
    expect(testLogger).toBeDefined();
    expect(testLogger.level).toBeDefined();
  });

  it("should create a logger with custom package name", () => {
    const testLogger = createLogger({ package: "db" });
    expect(testLogger).toBeDefined();
  });

  it("should accept custom log level override", () => {
    // Note: In test environment, logger level is always 'silent' due to isTest() check
    // This test verifies the config accepts the level parameter without error
    const testLogger = createLogger({ package: "api", level: "debug" });
    expect(testLogger).toBeDefined();
    // Actual level will be 'silent' in test mode
    expect(testLogger.level).toBeDefined();
  });

  it("should accept pretty option", () => {
    const testLogger = createLogger({ package: "api", pretty: true });
    expect(testLogger).toBeDefined();
  });

  it("should use different package names", () => {
    const packages: PackageName[] = ["api", "db", "stripe", "auth", "common"];
    packages.forEach((pkg) => {
      const testLogger = createLogger({ package: pkg });
      expect(testLogger).toBeDefined();
    });
  });
});

describe("logger.ts - Pre-configured loggers", () => {
  it("should export default logger", () => {
    expect(logger).toBeDefined();
  });

  it("should export apiLogger", () => {
    expect(apiLogger).toBeDefined();
  });

  it("should export dbLogger", () => {
    expect(dbLogger).toBeDefined();
  });

  it("should export stripeLogger", () => {
    expect(stripeLogger).toBeDefined();
  });

  it("should export authLogger", () => {
    expect(authLogger).toBeDefined();
  });
});

describe("logger.ts - LogMetadata type", () => {
  it("should allow optional requestId", () => {
    const metadata: LogMetadata = { requestId: "req-123" };
    expect(metadata.requestId).toBe("req-123");
  });

  it("should allow optional userId", () => {
    const metadata: LogMetadata = { userId: "user-456" };
    expect(metadata.userId).toBe("user-456");
  });

  it("should allow additional properties", () => {
    const metadata: LogMetadata = {
      requestId: "req-123",
      userId: "user-456",
      action: "create",
      resource: "cluster",
    };
    expect(metadata.action).toBe("create");
    expect(metadata.resource).toBe("cluster");
  });
});

describe("logger.ts - LoggerConfig type", () => {
  it("should require package in config", () => {
    const config: LoggerConfig = { package: "api" };
    expect(config.package).toBe("api");
  });

  it("should allow optional level override", () => {
    const config: LoggerConfig = { package: "api", level: "error" };
    expect(config.level).toBe("error");
  });

  it("should allow optional pretty flag", () => {
    const config: LoggerConfig = { package: "api", pretty: false };
    expect(config.pretty).toBe(false);
  });
});

describe("logger.ts - buildRedactConfig", () => {
  it("should return a config with paths array and censor string", () => {
    const config = buildRedactConfig();
    expect(config).toHaveProperty("paths");
    expect(Array.isArray(config.paths)).toBe(true);
    expect(config).toHaveProperty("censor");
    expect(config.censor).toBe("[REDACTED]");
  });

  it("should include sensitive field patterns as paths", () => {
    const config = buildRedactConfig();
    expect(config.paths).toContain("secret");
    expect(config.paths).toContain("token");
    expect(config.paths).toContain("password");
    expect(config.paths).toContain("credential");
    expect(config.paths).toContain("authorization");
    expect(config.paths).toContain("session");
    expect(config.paths).toContain("cookie");
  });

  it("should include nested path variants for each pattern", () => {
    const config = buildRedactConfig();
    expect(config.paths).toContain("*.secret");
    expect(config.paths).toContain("*.token");
    expect(config.paths).toContain("*.password");
  });

  it("should include api_key and private_key patterns", () => {
    const config = buildRedactConfig();
    expect(config.paths).toContain("api_key");
    expect(config.paths).toContain("*.api_key");
    expect(config.paths).toContain("private_key");
    expect(config.paths).toContain("*.private_key");
    expect(config.paths).toContain("privatekey");
    expect(config.paths).toContain("*.privatekey");
  });

  it("should not have duplicate paths", () => {
    const config = buildRedactConfig();
    const uniquePaths = new Set(config.paths);
    expect(uniquePaths.size).toBe(config.paths.length);
  });
});

describe("logger.ts - createLogger uses redact config", () => {
  it("should produce a logger instance (redact configured internally)", () => {
    const testLogger = createLogger({ package: "api" });
    expect(testLogger).toBeDefined();
    expect(testLogger.level).toBeDefined();
  });
});

describe("logger.ts - createLoggerWrapper", () => {
  it("should wrap a pino logger with BaseLogger interface", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    expect(typeof wrapped.debug).toBe("function");
    expect(typeof wrapped.info).toBe("function");
    expect(typeof wrapped.warn).toBe("function");
    expect(typeof wrapped.error).toBe("function");
  });

  it("should have callable debug method", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    expect(() => wrapped.debug("test message")).not.toThrow();
  });

  it("should have callable info method", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    expect(() => wrapped.info("test message")).not.toThrow();
  });

  it("should have callable warn method", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    expect(() => wrapped.warn("test message")).not.toThrow();
  });

  it("should have callable error method", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    expect(() => wrapped.error("test error")).not.toThrow();
  });

  it("should pass metadata to debug", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    const metadata: LogMetadata = { requestId: "req-123" };
    expect(() => wrapped.debug("test", metadata)).not.toThrow();
  });

  it("should pass metadata to info", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    const metadata: LogMetadata = { userId: "user-456" };
    expect(() => wrapped.info("test", metadata)).not.toThrow();
  });

  it("should pass metadata and error to error method", () => {
    const pinoLogger = createLogger({ package: "api" });
    const wrapped = createLoggerWrapper(pinoLogger);

    const error = new Error("test error");
    const metadata: LogMetadata = { requestId: "req-123" };
    expect(() =>
      wrapped.error("error occurred", error, metadata),
    ).not.toThrow();
  });
});

describe("logger.ts - Type exports", () => {
  it("should export PackageName type", () => {
    const packageNames: PackageName[] = [
      "api",
      "db",
      "stripe",
      "auth",
      "common",
    ];
    expect(packageNames.length).toBe(5);
  });

  it("should export LogMetadata interface", () => {
    const metadata: LogMetadata = {
      requestId: "req-1",
      userId: "user-1",
      custom: "value",
    };
    expect(metadata.requestId).toBeDefined();
    expect(metadata.userId).toBeDefined();
    expect(metadata.custom).toBe("value");
  });

  it("should export LoggerConfig interface", () => {
    const config: LoggerConfig = {
      package: "api",
      level: "info",
      pretty: false,
    };
    expect(config.package).toBe("api");
    expect(config.level).toBe("info");
    expect(config.pretty).toBe(false);
  });

  it("should export BaseLogger interface", () => {
    const pinoLogger = createLogger({ package: "api" });
    const loggerInterface: BaseLogger = createLoggerWrapper(pinoLogger);

    expect(typeof loggerInterface.debug).toBe("function");
    expect(typeof loggerInterface.info).toBe("function");
    expect(typeof loggerInterface.warn).toBe("function");
    expect(typeof loggerInterface.error).toBe("function");
  });
});
