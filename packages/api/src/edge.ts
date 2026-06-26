import { lazy } from "@trpc/server";

import { authRouter } from "./router/auth";
import { helloRouter } from "./router/hello";
import { createTRPCRouter } from "./trpc";

/**
 * Code splitting: heavy routers loaded lazily to reduce cold starts
 * in serverless environments. Only domain-specific routers with
 * server-only deps (Prisma, Stripe SDK) are lazy-loaded.
 *
 * @see https://trpc.io/docs/server/merging-routers#lazy-load-routers
 */
export const edgeRouter = createTRPCRouter({
  hello: helloRouter,
  auth: authRouter,
  admin: lazy(() => import("./router/admin").then((m) => m.adminRouter)),
  customer: lazy(() => import("./router/customer").then((m) => m.customerRouter)),
  k8s: lazy(() => import("./router/k8s").then((m) => m.k8sRouter)),
  stripe: lazy(() => import("./router/stripe").then((m) => m.stripeRouter)),
});
