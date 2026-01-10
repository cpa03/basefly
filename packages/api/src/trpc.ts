import type { NextRequest } from "next/server";
import {initTRPC, TRPCError} from "@trpc/server";
import {auth, currentUser, getAuth} from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { transformer } from "./transformer";
import { getLimiter, getIdentifier, EndpointType } from "./rate-limiter";
import { createApiError, ErrorCode } from "./errors";
import { getOrGenerateRequestId } from "./request-id";

export { EndpointType } from "./rate-limiter";

interface CreateContextOptions {
  req?: NextRequest;
  auth?: any;
}
type AuthObject = ReturnType<typeof getAuth>;
// see: https://clerk.com/docs/references/nextjs/trpc
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthObject;
}) => {
  const requestId = getOrGenerateRequestId(opts.headers);
  return {
    userId: opts.auth.userId,
    requestId,
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

export const rateLimit = (
  endpointType: EndpointType,
) =>
  t.middleware(async ({ ctx, next }) => {
    const limiter = getLimiter(endpointType);
    const identifier = getIdentifier(ctx.userId, (ctx as any).req);

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

export const createRateLimitedProtectedProcedure = (endpointType: EndpointType) =>
  protectedProcedure.use(rateLimit(endpointType));