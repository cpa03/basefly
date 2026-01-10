import { z } from "zod";

import {
  createTRPCRouter,
  createRateLimitedProtectedProcedure,
  EndpointType,
} from "../trpc";

export const helloRouter = createTRPCRouter({
  hello: createRateLimitedProtectedProcedure("read")
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts: { input: { text: string } }) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
