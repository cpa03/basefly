/**
 * Next.js Instrumentation Hook
 *
 * Runs once during server startup to validate environment variables
 * before any application code executes, and to initialize OpenTelemetry
 * telemetry when an OTLP endpoint is configured (issue #486).
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { initEnvValidation } from "@saasfly/common/config/env";
import { initializeTelemetry } from "@saasfly/common/observability";

export function register(): void {
  initEnvValidation();
  // No-op unless OTEL_EXPORTER_OTLP_ENDPOINT is configured
  initializeTelemetry({ serviceName: "basefly" });
}
