/**
 * CSRF protection for API route handlers.
 *
 * The root middleware (`proxy.ts`) already validates the Origin header for page
 * routes, but it intentionally skips `/api/*` and `/trpc/*` paths because
 * server-to-server clients (Stripe webhooks, uptime monitors) never send an
 * Origin header. This guard applies the same Origin check to the state-changing
 * POST requests that reach the tRPC API while leaving GET queries and
 * header-less clients untouched.
 *
 * Strategy (OWASP CSRF Prevention Cheat Sheet — "Verifying Origin With
 * Standard Headers"):
 * 1. Only POST requests are state-changing and therefore checked.
 * 2. When a browser sends an Origin header it must match either the request
 *    Host or `NEXT_PUBLIC_APP_URL`; otherwise the request is rejected.
 * 3. Requests without an Origin header (curl, server-to-server, privacy
 *    browsers) are allowed — browsers always attach Origin to cross-site POSTs,
 *    so an absent Origin is not exploitable for form-based CSRF.
 * 4. `CSRF_ALLOWED_ORIGINS` provides an explicit allow-list for legitimate
 *    cross-origin API consumers (comma-separated origins).
 */
export interface CsrfRequest {
  method: string;
  headers: Headers;
}

export function validateCSRF(req: CsrfRequest): boolean {
  // Only state-changing methods can be CSRF targets.
  if (req.method !== "POST") {
    return true;
  }

  const origin = req.headers.get("origin");
  // Non-browser clients and same-origin requests may omit Origin — allow.
  if (!origin) {
    return true;
  }

  let reqOrigin: string | null = null;
  try {
    reqOrigin = new URL(origin).origin;
  } catch {
    // Malformed Origin is never legitimate.
    return false;
  }

  // 1. Match against the Host header (works across all deployments).
  const host = req.headers.get("host");
  if (host) {
    try {
      if (new URL(`https://${host}`).host === new URL(reqOrigin).host) {
        return true;
      }
    } catch {
      // Malformed host — fall through to the NEXT_PUBLIC_APP_URL check.
    }
  }

  // 2. Match against NEXT_PUBLIC_APP_URL (covers proxies where Host differs).
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      if (new URL(appUrl).origin === reqOrigin) {
        return true;
      }
    } catch {
      // Malformed app URL — fall through to the allow-list.
    }
  }

  // 3. Explicit allow-list for legitimate cross-origin consumers.
  const allowedOrigins = process.env.CSRF_ALLOWED_ORIGINS;
  if (allowedOrigins) {
    const origins = allowedOrigins
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    if (origins.includes(origin) || origins.includes(reqOrigin)) {
      return true;
    }
  }

  return false;
}
