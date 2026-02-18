import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@saasfly/api";
import { edgeRouter } from "@saasfly/api/edge";

import { logger } from "~/lib/logger";

function isClerkEnabled(): boolean {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(
    clerkKey &&
    !clerkKey.includes("dummy") &&
    !clerkKey.includes("placeholder") &&
    clerkKey.startsWith("pk_") &&
    clerkKey.length > 20
  );
}

// export const runtime = "edge";
const createContext = async (req: NextRequest) => {
  let authResult = null;
  if (isClerkEnabled()) {
    try {
      authResult = getAuth(req);
    } catch (_error) {
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
