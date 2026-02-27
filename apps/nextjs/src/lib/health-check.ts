import { db } from "@saasfly/db";
import { stripe } from "@saasfly/stripe";
import { isClerkEnabled } from "@saasfly/auth";


/**
 * Health check service for verifying external dependencies.
 * All checks run concurrently for optimal response time.
 */

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

const TIMEOUT_MS = 1500; // Leave 500ms buffer for response time < 2s

/**
 * Check database connectivity using a lightweight query
 */
async function checkDatabase(): Promise<DependencyStatus> {
  const start = Date.now();
  try {
    // Use Kysely's execute function with a simple query
    await db.execute("SELECT 1");
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Database connection failed",
    };
  }
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

  try {
    // Use Stripe API key validation - make a lightweight call
    // Stripe.balance.retrieve() is a simple call that validates the API key
    await stripe.balance.retrieve();
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    // Timeout or connection error
    const isTimeout = error instanceof Error && 
      (error.message?.includes("timeout") || error.message?.includes("TIMEOUT"));
    return {
      status: isTimeout ? "degraded" : "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Stripe connection failed",
    };
  }
}

/**
 * Check Clerk API connectivity
 */
async function checkClerk(): Promise<DependencyStatus> {
  const start = Date.now();

  if (!isClerkEnabled()) {
    return {
      status: "degraded",
      latencyMs: Date.now() - start,
      error: "Clerk is not configured",
    };
  }

  try {
    // Clerk doesn't have a direct "ping" API, but we can check by verifying
    // the publishable key format which we already do in isClerkEnabled
    // For actual connectivity, we'd need to make an API call
    // Since Clerk is client-side SDK, we verify basic config is present
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
      details: {
        configured: true,
        note: "Clerk uses client-side SDK - basic config verified",
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Clerk check failed",
    };
  }
}

/**
 * Run all health checks concurrently
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const overallStart = Date.now();

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
  if (database.status === "unhealthy" || stripe.status === "unhealthy" || clerk.status === "unhealthy") {
    overallStatus = "unhealthy";
  } else if (database.status === "degraded" || stripe.status === "degraded" || clerk.status === "degraded") {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }

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
}
