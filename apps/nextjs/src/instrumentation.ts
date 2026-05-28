/**
 * Next.js Instrumentation Hook
 *
 * Runs once during server startup to validate environment variables
 * before any application code executes.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { initEnvValidation } from "@saasfly/common/config/env";

export function register(): void {
  initEnvValidation();
}
