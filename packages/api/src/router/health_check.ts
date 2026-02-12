import { z } from "zod";

import {
  createRateLimitedProtectedProcedure,
  createTRPCRouter,
  EndpointType,
} from "../trpc";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const helloRouter = createTRPCRouter({
  hello: createRateLimitedProtectedProcedure("read")
    .input(
      z.object({
        text: z.string().max(1000),
      }),
    )
    .query((opts: { input: { text: string } }) => {
      const sanitizedText = escapeHtml(opts.input.text.trim());
      return {
        greeting: `hello ${sanitizedText}`,
      };
    }),
});
