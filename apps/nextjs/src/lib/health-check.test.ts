/**
 * Health check service tests
 *
 * Verifies `performHealthCheck` dependency checks and the OpenTelemetry
 * span instrumentation (issue #486 - server-side observability).
 *
 * Reference: #486 - [P2][Observability] Add server-side observability with
 * OpenTelemetry. Acceptance criterion: "Key operations instrumented with
 * spans" — health check dependency probes are wrapped in spans named
 * `health.check.*` with correct status codes.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { performHealthCheck } from "./health-check";

const { mockExecute, mockStripe, mockIsClerkEnabled } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockStripe: {
    balance: { retrieve: vi.fn() },
  },
  mockIsClerkEnabled: vi.fn(),
}));

const { mockTracer, mockSpans } = vi.hoisted(() => {
  const mockSpans: {
    name: string;
    statusCode: number | undefined;
    attributes: Record<string, unknown>;
  }[] = [];

  const mockTracer = {
    startActiveSpan: vi.fn(
      (name: string, fn: (span: unknown) => Promise<unknown>) => {
        const record = { name, statusCode: undefined, attributes: {} };
        mockSpans.push(record);
        const span = {
          setAttribute: (key: string, value: unknown) => {
            record.attributes[key] = value;
          },
          setStatus: (status: { code: number }) => {
            record.statusCode = status.code;
          },
          recordException: vi.fn(),
          end: vi.fn(),
        };
        return fn(span);
      },
    ),
  };
  return { mockTracer, mockSpans };
});

vi.mock("@saasfly/db", () => ({
  db: {
    selectFrom: () => ({
      select: () => ({
        limit: () => ({
          execute: mockExecute,
        }),
      }),
    }),
  },
}));

vi.mock("@saasfly/stripe", () => ({
  stripe: mockStripe,
}));

vi.mock("@saasfly/auth", () => ({
  isClerkEnabled: mockIsClerkEnabled,
}));

vi.mock("@saasfly/common/observability", () => ({
  getTracer: () => mockTracer,
  SpanStatusCode: { OK: 0, ERROR: 2 },
}));

describe("performHealthCheck", () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockStripe.balance.retrieve.mockReset();
    mockIsClerkEnabled.mockReset();
    mockTracer.startActiveSpan.mockClear();
    mockSpans.length = 0;

    process.env.npm_package_version = "1.0.0";
    mockExecute.mockResolvedValue([{ id: "cluster-1" }]);
    mockStripe.balance.retrieve.mockResolvedValue({});
    mockIsClerkEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should report healthy when all dependencies respond", async () => {
    const result = await performHealthCheck();

    expect(result.status).toBe("healthy");
    expect(result.dependencies.database.status).toBe("healthy");
    expect(result.dependencies.stripe.status).toBe("healthy");
    expect(result.dependencies.clerk.status).toBe("healthy");
  });

  it("should report unhealthy when the database check fails", async () => {
    mockExecute.mockRejectedValue(new Error("connection refused"));

    const result = await performHealthCheck();

    expect(result.status).toBe("unhealthy");
    expect(result.dependencies.database.status).toBe("unhealthy");
    expect(result.dependencies.database.error).toContain("connection refused");
  });

  it("should report degraded when clerk is not configured", async () => {
    mockIsClerkEnabled.mockReturnValue(false);

    const result = await performHealthCheck();

    expect(result.status).toBe("degraded");
    expect(result.dependencies.clerk.status).toBe("degraded");
    expect(result.dependencies.clerk.error).toContain("not configured");
  });

  it("should wrap every dependency check in an OpenTelemetry span", async () => {
    await performHealthCheck();

    const spanNames = mockSpans.map((s) => s.name);
    expect(spanNames).toContain("health.check");
    expect(spanNames).toContain("health.check.database");
    expect(spanNames).toContain("health.check.stripe");
    expect(spanNames).toContain("health.check.clerk");
  });

  it("should record OK status on spans for healthy checks", async () => {
    await performHealthCheck();

    const databaseSpan = mockSpans.find(
      (s) => s.name === "health.check.database",
    );
    expect(databaseSpan?.statusCode).toBe(0);
    expect(databaseSpan?.attributes["health.dependency"]).toBe("database");
  });

  it("should record ERROR status when a dependency check fails", async () => {
    mockExecute.mockRejectedValue(new Error("connection refused"));

    await performHealthCheck();

    const databaseSpan = mockSpans.find(
      (s) => s.name === "health.check.database",
    );
    expect(databaseSpan?.statusCode).toBe(2);
  });

  it("should record the overall status attribute on the root span", async () => {
    mockExecute.mockRejectedValue(new Error("connection refused"));

    await performHealthCheck();

    const rootSpan = mockSpans.find((s) => s.name === "health.check");
    expect(rootSpan?.attributes["health.overall"]).toBe("unhealthy");
  });
});
