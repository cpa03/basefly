import type { NextRequest } from "next/server";
import { currentUser, type getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { isAdminEmail, IS_PROD } from "@saasfly/common";
import { db, type Role } from "@saasfly/db";

import {
  createOwnershipVerifier,
  verifyOwnership,
  verifyOwnershipWithFetch,
} from "./authorization";
import {
  getIdentifier,
  getLimiter,
  type EndpointType,
} from "./distributed-rate-limiter";
import { createApiError, ErrorCode } from "./errors";
import { logger } from "./logger";
import { getOrGenerateRequestId } from "./request-id";
import { transformer } from "./transformer";

export type { EndpointType } from "./distributed-rate-limiter";

/**
 * Rate limit information for response headers
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

type AuthObject = ReturnType<typeof getAuth> | null;

/**
 * Creates the tRPC context for each request.
 * Includes authenticated user ID, request ID for tracing, and request headers.
 *
 * @param opts - Context creation options
 * @returns tRPC context with userId, requestId, and headers
 */
export const createTRPCContext = (opts: {
  headers: Headers;
  auth: AuthObject;
  req?: NextRequest;
}) => {
  const requestId = getOrGenerateRequestId(opts.headers);
  return {
    userId: opts.auth?.userId ?? null,
    requestId,
    req: opts.req,
    rateLimitInfo: null as RateLimitInfo | null,
    role: null as Role | null,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/** Internal tRPC instance with custom error formatting */
export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error, ctx }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
        requestId: ctx?.requestId,
      },
    };
  },
});

/**
 * Extracts the origin (protocol + host) from a URL string.
 * Used for CSRF Referer header validation.
 */
function getOriginFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

/**
 * CSRF protection middleware.
 *
 * Validates the Origin or Referer header against the configured NEXT_PUBLIC_APP_URL
 * to prevent CSRF attacks on state-changing operations.
 *
 * - **Queries (GET)**: Skipped — read-only.
 * - **Production**: Missing/mismatched Origin/Referer → FORBIDDEN error.
 * - **Development**: Localhost origins allowed. Missing headers logged but not rejected.
 *
 * Must run early before authentication so CSRF violations are caught upfront.
 */
const csrfProtection = t.middleware(({ next, ctx, type }) => {
  if (type === "query") {
    return next();
  }

  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowedOrigin) {
    logger.warn(
      { requestId: ctx.requestId, security: true },
      "CSRF protection skipped: NEXT_PUBLIC_APP_URL not configured",
    );
    return next();
  }

  const headers = ctx.headers;
  const origin = headers.get("origin");
  const referer = headers.get("referer");
  const requestOrigin = origin ?? (referer ? getOriginFromUrl(referer) : null);

  if (!requestOrigin) {
    if (IS_PROD) {
      logger.warn(
        { requestId: ctx.requestId, security: true, reason: "missing_origin" },
        "CSRF validation failed: no Origin or Referer header",
      );
      throw createApiError(
        ErrorCode.CSRF_ERROR,
        "CSRF validation failed: request origin could not be determined",
      );
    }
    return next();
  }

  const normalizedRequestOrigin = requestOrigin.replace(/\/$/, "");
  const normalizedAllowedOrigin = allowedOrigin.replace(/\/$/, "");

  if (normalizedRequestOrigin !== normalizedAllowedOrigin) {
    const isLocalhost =
      normalizedRequestOrigin.includes("localhost") ||
      normalizedRequestOrigin.includes("127.0.0.1") ||
      normalizedRequestOrigin.includes("[::1]");

    if (!IS_PROD && isLocalhost) {
      logger.debug(
        { requestId: ctx.requestId, security: true, requestOrigin: normalizedRequestOrigin },
        "CSRF check: allowed localhost origin in development",
      );
      return next();
    }

    logger.warn(
      {
        requestId: ctx.requestId,
        security: true,
        reason: "origin_mismatch",
        requestOrigin: normalizedRequestOrigin,
        allowedOrigin: normalizedAllowedOrigin,
        type,
      },
      "CSRF validation failed: Origin mismatch",
    );

    throw createApiError(
      ErrorCode.CSRF_ERROR,
      "CSRF validation failed: request origin does not match application origin",
    );
  }

  return next();
});

/** Creates a new tRPC router with typed context */
export const createTRPCRouter = t.router;
/** Base procedure with CSRF protection */
export const procedure = t.procedure.use(csrfProtection);
export const mergeRouters = t.mergeRouters;

// Authorization helpers - re-export for convenience
export { verifyOwnership, verifyOwnershipWithFetch, createOwnershipVerifier };

/**
 * Middleware that ensures the user is authenticated.
 * Throws UNAUTHORIZED error if no userId is present in context.
 * After this middleware, ctx.userId is guaranteed to be a non-null string.
 */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    logger.warn(
      {
        requestId: ctx.requestId,
        security: true,
        reason: "missing_user_id",
      },
      "Authentication failed - unauthorized access attempt",
    );
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { userId: ctx.userId } });
});

/**
 * Protected procedure that requires authentication.
 * Use this for endpoints that require a logged-in user.
 * Context will have userId as a non-null string.
 */
export const protectedProcedure = procedure.use(isAuthed);

/**
 * Middleware that ensures the user is authenticated AND is an admin.
 * Checks the user's role in the database first (role-based access control).
 * Falls back to ADMIN_EMAIL environment variable for backward compatibility.
 * Throws UNAUTHORIZED if not logged in, FORBIDDEN if not admin.
 */
const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const userRecord = await db
      .selectFrom("User")
      .select("role")
      .where("id", "=", ctx.userId)
      .executeTakeFirst();

    if (userRecord?.role === "ADMIN") {
      return next({ ctx: { userId: ctx.userId, isAdmin: true } });
    }
  } catch (error) {
    logger.error(
      { requestId: ctx.requestId, userId: ctx.userId, error },
      "Failed to check user role from database, falling back to email-based check",
    );
  }

  // Fallback: check ADMIN_EMAIL environment variable (migration path)
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!isAdminEmail(userEmail)) {
    logger.warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        security: true,
        reason: "not_admin",
      },
      "Admin access denied",
    );
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx: { userId: ctx.userId, isAdmin: true } });
});

/**
 * Admin-only procedure that requires authentication AND admin role.
 * Use this for security-critical admin endpoints.
 * Context will have userId (string) and isAdmin (true).
 */
export const adminProcedure = protectedProcedure.use(isAdmin);

/**
 * Role-based middleware factory.
 * Creates a middleware that checks if the authenticated user has the specified role.
 * The role check is performed against the database User.role field.
 *
 * @param requiredRole - The role required to access the protected resource
 * @returns tRPC middleware that enforces the role check
 * @throws {TRPCError} UNAUTHORIZED if not authenticated
 * @throws {TRPCError} FORBIDDEN if user does not have the required role
 *
 * @example
 * ```ts
 * const requireAdmin = requireRole(Role.ADMIN);
 * const adminProcedure = protectedProcedure.use(requireAdmin);
 * ```
 */
export const requireRole = (requiredRole: Role) =>
  t.middleware(async ({ next, ctx }) => {
    if (!ctx.userId) {
      logger.warn(
        { requestId: ctx.requestId, security: true, reason: "missing_user_id" },
        `Authentication required for role ${requiredRole}`,
      );
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const userRecord = await db
        .selectFrom("User")
        .select("role")
        .where("id", "=", ctx.userId)
        .executeTakeFirst();

      if (userRecord?.role === requiredRole) {
        return next({
          ctx: { ...ctx, userId: ctx.userId, role: requiredRole },
        });
      }
    } catch (error) {
      logger.error(
        { requestId: ctx.requestId, userId: ctx.userId, error },
        `Failed to check user role from database for role ${requiredRole}`,
      );
    }

    logger.warn(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        requiredRole,
        security: true,
        reason: "insufficient_role",
      },
      `Access denied: ${requiredRole} role required`,
    );
    throw createApiError(
      ErrorCode.FORBIDDEN,
      `Access denied: ${requiredRole} role required`,
    );
  });

/**
 * Creates a role-based procedure that enforces both authentication and the specified role.
 * Use this for endpoints that require a specific user role.
 *
 * @param role - The role required to access the endpoint
 * @returns A tRPC procedure with authentication and role enforcement
 *
 * @example
 * ```ts
 * const adminProcedure = createRoleBasedProcedure(Role.ADMIN);
 * export const adminRouter = createTRPCRouter({
 *   getStats: adminProcedure.query(async () => { ... }),
 * });
 * ```
 */
export const createRoleBasedProcedure = (role: Role) =>
  protectedProcedure.use(requireRole(role));

/**
 * Creates a rate-limiting middleware for the specified endpoint type.
 * Uses token bucket algorithm with configurable limits per endpoint type.
 * Sets rateLimitInfo in context for response header injection.
 *
 * @param endpointType - The type of endpoint (read, write, stripe)
 * @returns tRPC middleware that enforces rate limiting
 */
export const rateLimit = (endpointType: EndpointType) =>
  t.middleware(async ({ ctx, next }) => {
    const limiter = getLimiter(endpointType);
    const req = ctx.req;
    const identifier = getIdentifier(ctx.userId, req);

    const result = await limiter.checkAsync(identifier);

    if (!result.success) {
      logger.warn(
        {
          identifier,
          endpointType,
          requestId: ctx.requestId,
          userId: ctx.userId,
          resetAt: result.resetAt,
        },
        "Rate limit exceeded - potential abuse detected",
      );

      throw createApiError(
        ErrorCode.TOO_MANY_REQUESTS,
        "Rate limit exceeded. Please try again later.",
        {
          resetAt: result.resetAt,
        },
      );
    }

    // Store rate limit info in context for response header injection
    const rateLimitInfo: RateLimitInfo = {
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };

    const response = await next({
      ctx: {
        ...ctx,
        rateLimitInfo,
      },
    });

    return response;
  });

/**
 * Creates a rate-limited public procedure.
 * Use for unauthenticated endpoints that need rate limiting.
 *
 * @param endpointType - The type of endpoint for rate limit configuration
 */
export const createRateLimitedProcedure = (endpointType: EndpointType) =>
  procedure.use(rateLimit(endpointType));

/**
 * Creates a rate-limited protected procedure.
 * Combines authentication with rate limiting.
 *
 * @param endpointType - The type of endpoint for rate limit configuration
 */
export const createRateLimitedProtectedProcedure = (
  endpointType: EndpointType,
) => protectedProcedure.use(rateLimit(endpointType));

/**
 * Creates a rate-limited admin procedure.
 * Combines admin authentication with rate limiting.
 *
 * @param endpointType - The type of endpoint for rate limit configuration
 */
export const createRateLimitedAdminProcedure = (endpointType: EndpointType) =>
  adminProcedure.use(rateLimit(endpointType));
