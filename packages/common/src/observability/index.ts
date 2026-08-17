/**
 * Centralized OpenTelemetry Observability
 *
 * A unified telemetry setup for the Basefly platform (issue #486).
 * Provides:
 * - Environment-gated NodeSDK initialization (no-op when no OTLP endpoint
 *   is configured, so local dev / CI / tests stay deterministic)
 * - A global tracer accessor backed by @opentelemetry/api (safe no-op
 *   when the SDK is not running, so instrumentation can be added freely)
 * - Graceful shutdown for server lifecycle hooks
 *
 * Usage:
 * ```ts
 * // During server startup (Next.js instrumentation hook):
 * import { initializeTelemetry } from "@saasfly/common/observability";
 * initializeTelemetry({ serviceName: "basefly" });
 *
 * // Anywhere in the request path (safe no-op without SDK):
 * import { getTracer } from "@saasfly/common/observability";
 * const span = getTracer("basefly-api").startSpan("operation");
 * ```
 *
 * @module @saasfly/common/observability
 */

import { trace, SpanStatusCode, type Tracer } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export { SpanStatusCode };

/** Default service name applied to resources when none is provided */
export const DEFAULT_SERVICE_NAME = "basefly";

/**
 * Telemetry initialization options
 */
export interface TelemetryOptions {
  /** Service name recorded on all traces (defaults to OTEL_SERVICE_NAME or "basefly") */
  serviceName?: string;
  /** Service version recorded on all traces (e.g. git SHA) */
  serviceVersion?: string;
  /** OTLP HTTP endpoint override (defaults to OTEL_EXPORTER_OTLP_ENDPOINT) */
  endpoint?: string;
}

let sdk: NodeSDK | null = null;
let initialized = false;

/**
 * Whether telemetry is enabled for this process.
 *
 * Telemetry is enabled only when an OTLP endpoint is explicitly configured
 * via `OTEL_EXPORTER_OTLP_ENDPOINT` and not disabled via
 * `OTEL_SDK_DISABLED`. This keeps local development, CI, and tests free of
 * background exporter sockets while allowing production deployments to opt
 * in by setting the standard OpenTelemetry environment variable.
 */
export function isTelemetryEnabled(): boolean {
  if (process.env.OTEL_SDK_DISABLED === "true") {
    return false;
  }
  return Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
}

/**
 * Initializes the OpenTelemetry NodeSDK.
 *
 * Safe to call multiple times — only the first call starts the SDK. When no
 * OTLP endpoint is configured (or the SDK is disabled), this returns `null`
 * and leaves the global tracer as the @opentelemetry/api no-op, so existing
 * instrumentation continues to work without side effects.
 *
 * @param options - Service identity and endpoint overrides
 * @returns The started NodeSDK, or `null` when telemetry is disabled
 */
export function initializeTelemetry(
  options: TelemetryOptions = {},
): NodeSDK | null {
  if (initialized) {
    return sdk;
  }

  if (!isTelemetryEnabled()) {
    return null;
  }

  initialized = true;

  const serviceName =
    options.serviceName ??
    process.env.OTEL_SERVICE_NAME ??
    DEFAULT_SERVICE_NAME;

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      ...(options.serviceVersion
        ? { [ATTR_SERVICE_VERSION]: options.serviceVersion }
        : {}),
    }),
    traceExporter: new OTLPTraceExporter({
      url: options.endpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
  });

  sdk.start();
  return sdk;
}

/**
 * Returns a tracer for the given component.
 *
 * Uses the @opentelemetry/api global registry, so when the SDK has not been
 * started this returns a lightweight no-op tracer — instrumentation added
 * through this accessor is always safe to call.
 *
 * @param component - Instrumentation scope (e.g. "basefly-api")
 * @returns A tracer instance
 */
export function getTracer(component = DEFAULT_SERVICE_NAME): Tracer {
  return trace.getTracer(component);
}

/**
 * Shuts down the OpenTelemetry SDK, flushing any pending spans.
 *
 * Intended for server lifecycle hooks (e.g. graceful shutdown). Safe to call
 * when telemetry was never initialized.
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
    initialized = false;
  }
}
