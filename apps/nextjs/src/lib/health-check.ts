import { isClerkEnabled } from "@saasfly/auth";
import { getTracer, SpanStatusCode } from "@saasfly/common/observability";
import { db } from "@saasfly/db";
import { stripe } from "@saasfly/stripe";

/**
 * Health check service for verifying external dependencies.
 * All checks run concurrently for optimal response time.
 */

/**
 * Tracer for health check spans (issue #486 - observability).
 * Safe when telemetry is disabled: @opentelemetry/api falls back to a
 * no-op tracer, so this adds no overhead outside instrumented deployments.
 */
const tracer = getTracer("basefly-health");

export interface DependencyStatus {
  status: "healthy" | "unhealthy" | "degraded";
  latencyMs?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  dependencies: {
    database: DependencyStatus;
    stripe: DependencyStatus;
    clerk: DependencyStatus;
  };
  responseTimeMs: number;
}

/**
 * Check database connectivity using a lightweight query
 */
async function checkDatabase(): Promise<DependencyStatus> {
  const start = Date.now();
  return tracer.startActiveSpan("health.check.database", async (span) => {
    span.setAttribute("health.dependency", "database");
    try {
      await db.selectFrom("K8sClusterConfig").select("id").limit(1).execute();
      span.setStatus({ code: SpanStatusCode.OK });
      return {
        status: "healthy",
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      return {
        status: "unhealthy",
        latencyMs: Date.now() - start,
        error:
          error instanceof Error ? error.message : "Database connection failed",
      };
    } finally {
      span.end();
    }
  });
}

/**
 * Check Stripe API connectivity with a lightweight call
 */
async function checkStripe(): Promise<DependencyStatus> {
  const start = Date.now();

  if (!stripe) {
    return {
      status: "degraded",
      latencyMs: Date.now() - start,
      error: "Stripe is not configured",
    };
  }

  return tracer.startActiveSpan("health.check.stripe", async (span) => {
    span.setAttribute("health.dependency", "stripe");
    try {
      // Use Stripe API key validation - make a lightweight call
      // Stripe.balance.retrieve() is a simple call that validates the API key
      await stripe.balance.retrieve();
      span.setStatus({ code: SpanStatusCode.OK });
      return {
        status: "healthy",
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      // Timeout or connection error
      const isTimeout =
        error instanceof Error &&
        (error.message?.includes("timeout") ||
          error.message?.includes("TIMEOUT"));
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      return {
        status: isTimeout ? "degraded" : "unhealthy",
        latencyMs: Date.now() - start,
        error:
          error instanceof Error ? error.message : "Stripe connection failed",
      };
    } finally {
      span.end();
    }
  });
}

/**
 * Check Clerk API connectivity
 */
function checkClerk(): Promise<DependencyStatus> {
  const start = Date.now();

  if (!isClerkEnabled()) {
    return Promise.resolve({
      status: "degraded",
      latencyMs: Date.now() - start,
      error: "Clerk is not configured",
    });
  }

  return Promise.resolve(
    tracer.startActiveSpan("health.check.clerk", (span) => {
      span.setAttribute("health.dependency", "clerk");
      try {
        span.setStatus({ code: SpanStatusCode.OK });
        return {
          status: "healthy",
          latencyMs: Date.now() - start,
          details: {
            configured: true,
            note: "Clerk uses client-side SDK - basic config verified",
          },
        };
      } finally {
        span.end();
      }
    }),
  );
}

/**
 * Run all health checks concurrently
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const overallStart = Date.now();

  return tracer.startActiveSpan("health.check", async (span) => {
    // Run all checks in parallel
    const [database, stripe, clerk] = await Promise.all([
      checkDatabase().catch((e) => ({
        status: "unhealthy" as const,
        error: e instanceof Error ? e.message : "Check failed",
        latencyMs: 0,
      })),
      checkStripe().catch((e) => ({
        status: "unhealthy" as const,
        error: e instanceof Error ? e.message : "Check failed",
        latencyMs: 0,
      })),
      checkClerk().catch((e) => ({
        status: "unhealthy" as const,
        error: e instanceof Error ? e.message : "Check failed",
        latencyMs: 0,
      })),
    ]);

    const responseTimeMs = Date.now() - overallStart;

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy";
    if (
      database.status === "unhealthy" ||
      stripe.status === "unhealthy" ||
      clerk.status === "unhealthy"
    ) {
      overallStatus = "unhealthy";
    } else if (
      database.status === "degraded" ||
      stripe.status === "degraded" ||
      clerk.status === "degraded"
    ) {
      overallStatus = "degraded";
    } else {
      overallStatus = "healthy";
    }

    span.setAttribute("health.overall", overallStatus);
    span.setAttribute("health.response_time_ms", responseTimeMs);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      dependencies: {
        database,
        stripe,
        clerk,
      },
      responseTimeMs,
    };
  });
}
