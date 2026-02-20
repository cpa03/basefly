import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@saasfly/api";
import { edgeRouter } from "@saasfly/api/edge";
import { isClerkEnabled } from "@saasfly/auth";

import { logger } from "~/lib/logger";

export const runtime = "edge";
const createContext = async (req: NextRequest) => {
  let authResult = null;
  if (isClerkEnabled()) {
    try {
      authResult = getAuth(req);
    } catch {
      logger.debug(
        "Clerk auth failed in edge context, continuing unauthenticated",
      );
      authResult = null;
    }
  }
  return createTRPCContext({
    headers: req.headers,
    auth: authResult,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router: edgeRouter,
    req: req,
    createContext: () => createContext(req),
    onError: ({ error, path }) => {
      logger.error("Error in tRPC handler (edge)", error, { path });
    },
  });

export { handler as GET, handler as POST };
