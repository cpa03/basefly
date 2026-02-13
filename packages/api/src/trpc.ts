import type { NextRequest } from "next/server";
import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

import { createApiError, ErrorCode } from "./errors";
import { EndpointType, getIdentifier, getLimiter } from "./rate-limiter";
import { getOrGenerateRequestId } from "./request-id";
import { transformer } from "./transformer";

export type { EndpointType } from "./rate-limiter";

interface CreateContextOptions {
  req?: NextRequest;
  auth?: ReturnType<typeof getAuth> | null;
}
type AuthObject = ReturnType<typeof getAuth> | null;
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthObject;
  req?: NextRequest;
}) => {
  const requestId = getOrGenerateRequestId(opts.headers);
  return {
    userId: opts.auth?.userId ?? null,
    requestId,
    req: opts.req,
    ...opts,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

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

export const createTRPCRouter = t.router;
export const procedure = t.procedure;
export const mergeRouters = t.mergeRouters;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Make ctx.userId non-nullable in protected procedures
  return next({ ctx: { userId: ctx.userId } });
});

export const protectedProcedure = procedure.use(isAuthed);

export const rateLimit = (endpointType: EndpointType) =>
  t.middleware(async ({ ctx, next }) => {
    const limiter = getLimiter(endpointType);
    const req = "req" in ctx ? (ctx.req as NextRequest | undefined) : undefined;
    const identifier = getIdentifier(ctx.userId, req);

    const result = limiter.check(identifier);

    if (!result.success) {
      throw createApiError(
        ErrorCode.TOO_MANY_REQUESTS,
        "Rate limit exceeded. Please try again later.",
        {
          resetAt: result.resetAt,
        },
      );
    }

    const response = await next();

    return response;
  });

export const createRateLimitedProcedure = (endpointType: EndpointType) =>
  procedure.use(rateLimit(endpointType));

export const createRateLimitedProtectedProcedure = (
  endpointType: EndpointType,
) => protectedProcedure.use(rateLimit(endpointType));
