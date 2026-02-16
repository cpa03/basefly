import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import {
  createTRPCProxyClient,
  loggerLink,
  TRPCClientError,
} from "@trpc/client";
import { callProcedure } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { TRPCErrorResponse } from "@trpc/server/rpc";

import type { AppRouter } from "@saasfly/api";
import { TRPC_SOURCE_VALUES } from "@saasfly/common";

import { appRouter } from "../../../../packages/api/src/root";
import { transformer } from "./shared";

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

type AuthObject = Awaited<ReturnType<typeof auth>>;

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthObject | null;
  // eslint-disable-next-line @typescript-eslint/require-await
}) => {
  return {
    userId: opts.auth?.userId ?? null,
    ...opts,
  };
};

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const cookieStore = await cookies();
  // Convert cookie store to string properly
  const cookieHeader = Array.from(cookieStore.getAll())
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  let authResult: AuthObject | null = null;

  if (isClerkEnabled()) {
    try {
      authResult = await auth();
    } catch {
      authResult = null;
    }
  }

  return createTRPCContext({
    headers: new Headers({
      cookie: cookieHeader,
      "x-trpc-source": TRPC_SOURCE_VALUES.RSC,
    }),
    auth: authResult,
  });
});

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                rawInput: op.input,
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});
export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
