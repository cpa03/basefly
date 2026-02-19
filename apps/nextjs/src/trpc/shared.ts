/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import {
  httpBatchLink,
  type HTTPBatchLinkOptions,
  type HTTPHeaders,
  type TRPCLink,
} from "@trpc/client";

import type { AppRouter } from "@saasfly/api";
import { getBaseUrl as getSharedBaseUrl } from "@saasfly/common";

import { env } from "~/env.mjs";

export { transformer } from "@saasfly/api/transformer";

/**
 * Get the base URL for API requests.
 * Uses shared getBaseUrl from @saasfly/common for consistency across packages.
 * Returns empty string in browser context (client-side uses relative URLs).
 */
const getBaseUrl = (): string => {
  if (typeof window !== "undefined") return "";

  return getSharedBaseUrl(env.NEXT_PUBLIC_APP_URL, process.env.NODE_ENV);
};

const lambdas = [""];

export const endingLink = (opts?: {
  headers?: HTTPHeaders | (() => HTTPHeaders);
}) =>
  ((runtime) => {
    const sharedOpts = {
      headers: opts?.headers,
    } satisfies Partial<HTTPBatchLinkOptions>;

    const edgeLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/edge`,
    })(runtime);
    const lambdaLink = httpBatchLink({
      ...sharedOpts,
      url: `${getBaseUrl()}/api/trpc/lambda`,
    })(runtime);

    return (ctx) => {
      const path = ctx.op.path.split(".") as [string, ...string[]];
      const endpoint = lambdas.includes(path[0]) ? "lambda" : "edge";

      const newCtx = {
        ...ctx,
        op: { ...ctx.op, path: path.join(".") },
      };
      return endpoint === "edge" ? edgeLink(newCtx) : lambdaLink(newCtx);
    };
  }) satisfies TRPCLink<AppRouter>;
