import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import {
  createTRPCContext,
  getRateLimitHeaders,
  type RateLimitInfo,
} from "@saasfly/api";
import { edgeRouter } from "@saasfly/api/edge";
import { isClerkEnabled } from "@saasfly/auth";

import { logger } from "~/lib/logger";

export const runtime = "edge";

interface ContextWithRateLimit {
  rateLimit?: RateLimitInfo;
}

const createContext = async (req: NextRequest) => {
  let authResult = null;
  if (isClerkEnabled()) {
    try {
      authResult = getAuth(req);
    } catch {
      authResult = null;
    }
  }
  return createTRPCContext({
    headers: req.headers,
    auth: authResult,
    req,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router: edgeRouter,
    req: req,
    createContext: () => createContext(req),
    responseMeta: ({ ctx }) => {
      const rateLimit = (ctx as ContextWithRateLimit | undefined)?.rateLimit;
      return {
        headers: getRateLimitHeaders(rateLimit),
      };
    },
    onError: ({ error, path }) => {
      logger.error("Error in tRPC handler (edge)", error, { path });
    },
  });

export { handler as GET, handler as POST };
