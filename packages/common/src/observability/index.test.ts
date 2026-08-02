import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SERVICE_NAME,
  getTracer,
  initializeTelemetry,
  isTelemetryEnabled,
  shutdownTelemetry,
} from "./index";

const ORIGINAL_ENV = { ...process.env };

describe("observability/index.ts - isTelemetryEnabled", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("should be disabled when no OTLP endpoint is configured", () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    delete process.env.OTEL_SDK_DISABLED;
    expect(isTelemetryEnabled()).toBe(false);
  });

  it("should be disabled when OTEL_SDK_DISABLED is true", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    process.env.OTEL_SDK_DISABLED = "true";
    expect(isTelemetryEnabled()).toBe(false);
  });

  it("should be enabled when an OTLP endpoint is configured", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    delete process.env.OTEL_SDK_DISABLED;
    expect(isTelemetryEnabled()).toBe(true);
  });
});

describe("observability/index.ts - initializeTelemetry", () => {
  afterEach(async () => {
    await shutdownTelemetry();
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("should return null when telemetry is disabled", () => {
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const sdk = initializeTelemetry({ serviceName: "test" });
    expect(sdk).toBeNull();
  });

  it("should return the SDK instance when enabled", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    const sdk = initializeTelemetry({ serviceName: "test" });
    expect(sdk).not.toBeNull();
  });

  it("should be idempotent - subsequent calls return the same instance", () => {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
    const first = initializeTelemetry({ serviceName: "test" });
    const second = initializeTelemetry({ serviceName: "test" });
    expect(second).toBe(first);
  });
});

describe("observability/index.ts - getTracer", () => {
  it("should return a tracer without throwing when SDK is not running", () => {
    const tracer = getTracer("test-component");
    expect(tracer).toBeDefined();
    expect(typeof tracer.startSpan).toBe("function");
  });

  it("should use the default service name when no component is given", () => {
    const tracer = getTracer();
    expect(tracer).toBeDefined();
  });

  it("should export a default service name constant", () => {
    expect(DEFAULT_SERVICE_NAME).toBe("basefly");
  });
});

describe("observability/index.ts - shutdownTelemetry", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("should not throw when called without initialization", async () => {
    await expect(shutdownTelemetry()).resolves.toBeUndefined();
  });
});
