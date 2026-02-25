import type { NextRequest } from "next/server";
import type { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { isAdminEmail } from "@saasfly/common";

import { createApiError, ErrorCode } from "./errors";
import { logger } from "./logger";
import type { EndpointType} from "./rate-limiter";
import { getIdentifier, getLimiter } from "./rate-limiter";
import { getOrGenerateRequestId } from "./request-id";
import { transformer } from "./transformer";

import { db, setRLSSession } from "@saasfly/db";

export type { EndpointType } from "./rate-limiter";

/**
 * Rate limit information for response headers
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Options for creating tRPC context.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CreateContextOptions {
  req?: NextRequest;
  auth?: ReturnType<typeof getAuth> | null;
}

 
type AuthObject = ReturnType<typeof getAuth> | null;

/**
// eslint-disable-next-line @typescript-eslint/no-unused-vars

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

/** Creates a new tRPC router with typed context */
export const createTRPCRouter = t.router;
/** Base procedure without any middleware */
export const procedure = t.procedure;
/** Merges multiple routers into one */
export const mergeRouters = t.mergeRouters;

/**
 * Middleware that ensures the user is authenticated.
 * Throws UNAUTHORIZED error if no userId is present in context.
 * After this middleware, ctx.userId is guaranteed to be a non-null string.
 */
/**
 * Middleware that ensures the user is authenticated.
 * Throws UNAUTHORIZED error if no userId is present in context.
 * After this middleware, ctx.userId is guaranteed to be a non-null string.
 *
 * Also sets RLS (Row-Level Security) session variable for multi-tenant isolation.
 */
const isAuthed = t.middleware(async ({ next, ctx }) => {
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

  // Set RLS session variable for database queries
  // This enables Row-Level Security policies to filter data by tenant
  try {
    await setRLSSession(db, ctx.userId);
  } catch (error) {
    logger.error(
      {
        requestId: ctx.requestId,
        userId: ctx.userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Failed to set RLS session - continuing without tenant isolation",
    );
    // Continue even if RLS fails - don't block the request
    // RLS is defense-in-depth, not a hard requirement
  }

  return next({ ctx: { userId: ctx.userId } });
});

/**
 * Protected procedure that requires authentication.
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

/**
 * Protected procedure that requires authentication.
 * Use this for endpoints that require a logged-in user.
 * Context will have userId as a non-null string.
 */
export const protectedProcedure = procedure.use(isAuthed);

/**
 * Middleware that ensures the user is authenticated AND is an admin.
 * Checks ADMIN_EMAIL environment variable for admin email list.
 * Throws UNAUTHORIZED if not logged in, FORBIDDEN if not admin.
 */
const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!isAdminEmail(userEmail)) {
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
 * Creates a rate-limiting middleware for the specified endpoint type.
 * Uses token bucket algorithm with configurable limits per endpoint type.
 *
 * @param endpointType - The type of endpoint (read, write, stripe)
 * @returns tRPC middleware that enforces rate limiting
 */
export const rateLimit = (endpointType: EndpointType) =>
  t.middleware(async ({ ctx, next }) => {
    const limiter = getLimiter(endpointType);
    const req = "req" in ctx ? (ctx.req) : undefined;
    const identifier = getIdentifier(ctx.userId, req);

    const result = limiter.check(identifier);

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

    const response = await next({
      ctx: {
        rateLimitInfo: {
          limit: result.limit,
          remaining: result.remaining,
          resetAt: result.resetAt,
        },
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
