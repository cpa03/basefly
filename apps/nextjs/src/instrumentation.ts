/**
 * Next.js Instrumentation Hook
 *
 * Runs once during server startup to validate environment variables
 * before any application code executes, and to initialize OpenTelemetry
 * telemetry when an OTLP endpoint is configured (issue #486).
 *
 * Also initializes Sentry error tracking when `SENTRY_DSN` is configured
 * (issue #580). Sentry captures uncaught exceptions and unhandled promise
 * rejections on the Node.js runtime. It is intentionally a no-op in the
 * Edge runtime (where `@sentry/node` is not available) and when no DSN is
 * set, so development and CI environments are unaffected.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { initEnvValidation } from "@saasfly/common/config/env";
import { initializeTelemetry } from "@saasfly/common/observability";

export async function register(): Promise<void> {
  initEnvValidation();
  // No-op unless OTEL_EXPORTER_OTLP_ENDPOINT is configured
  initializeTelemetry({ serviceName: "basefly" });

  // No-op unless SENTRY_DSN is configured and running on the Node.js runtime.
  // `@sentry/node` is not available in the Edge runtime, so the dynamic import
  // is guarded to keep the Edge bundle clean.
  //
  // The SDK's default integrations (OnUncaughtException, OnUnhandledRejection)
  // capture uncaught exceptions and unhandled promise rejections.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/node");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV ?? "development",
      tracesSampleRate: 0.1,
    });
  }
}
