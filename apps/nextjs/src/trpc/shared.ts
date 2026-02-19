import {
  httpBatchLink,
  type HTTPBatchLinkOptions,
  type HTTPHeaders,
  type TRPCLink,
} from "@trpc/client";

import type { AppRouter } from "@saasfly/api";
import { DEV_URLS, ENV_ERRORS } from "@saasfly/common";

import { env } from "~/env.mjs";

export { transformer } from "@saasfly/api/transformer";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return appUrl;

  if (process.env.NODE_ENV === "development") {
    return DEV_URLS.localhost;
  }

  throw new Error(ENV_ERRORS.APP_URL_NOT_DEFINED);
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
