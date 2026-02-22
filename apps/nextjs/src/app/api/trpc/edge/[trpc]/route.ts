import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@saasfly/api";
import { edgeRouter } from "@saasfly/api/edge";
import { isClerkEnabled } from "@saasfly/auth";

import { logger } from "~/lib/logger";

/**
 * Explicit edge runtime declaration for Vercel optimization
 * - Enables global edge distribution
 * - Near-zero cold start latency
 * - Required for edge-compatible tRPC router
 */
export const runtime = "edge";

const createContext = async (req: NextRequest) => {
  let authResult = null;
  if (isClerkEnabled()) {
    try {
      authResult = getAuth(req);
    } catch (error) {
      logger.debug(
        "Clerk auth failed in edge context, continuing unauthenticated",
        { error: error instanceof Error ? error.message : String(error) },
      );
      authResult = null;
    }
  }
  return createTRPCContext({
    headers: req.headers,
    auth: authResult,
  });
};

const RATE_LIMIT_HEADERS = {
  limit: "X-RateLimit-Limit",
  remaining: "X-RateLimit-Remaining",
  reset: "X-RateLimit-Reset",
} as const;

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router: edgeRouter,
    req: req,
    createContext: () => createContext(req),
    responseMeta: ({ ctx }) => {
      const headers: Record<string, string> = {};

      if (ctx?.rateLimitInfo) {
        const info = ctx.rateLimitInfo;
        headers[RATE_LIMIT_HEADERS.limit] = String(info.limit);
        headers[RATE_LIMIT_HEADERS.remaining] = String(info.remaining);
        headers[RATE_LIMIT_HEADERS.reset] = String(
          Math.ceil(info.resetAt / 1000),
        );
      }

      return { headers };
    },
    onError: ({ error, path }) => {
      logger.error("Error in tRPC handler (edge)", error, { path });
    },
  });

export { handler as GET, handler as POST };
