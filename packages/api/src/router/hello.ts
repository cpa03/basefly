import { z } from "zod";

import { API_VALIDATION } from "@saasfly/common";

import { createApiError, ErrorCode } from "../errors";
import { logger } from "../logger";
import { createRateLimitedProtectedProcedure, createTRPCRouter } from "../trpc";

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param unsafe - The string to escape
 * @returns The escaped string safe for HTML output
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const helloInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(API_VALIDATION.text.minLength, "Text cannot be empty")
    .max(
      API_VALIDATION.text.maxLength,
      `Text cannot exceed ${API_VALIDATION.text.maxLength} characters`,
    ),
});

// Output validation schema - ensures response shape is guaranteed
const helloOutputSchema = z.object({
  greeting: z
    .string()
    .startsWith("hello ", "Greeting must start with 'hello '"),
});

/**
 * Hello Router
 *
 * Provides greeting endpoints for API validation.
 * Used to verify the API is running and responding correctly.
 *
 * @module helloRouter
 */
export const helloRouter = createTRPCRouter({
  /**
   * Hello/Greeting Endpoint
   *
   * Returns a sanitized greeting message for the authenticated user.
   * Input text is HTML-escaped to prevent XSS attacks.
   *
   * @param input - User-provided text (will be sanitized)
   * @returns Greeting object with sanitized text
   * @throws {TRPCError} UNAUTHORIZED - If user is not authenticated
   * @throws {TRPCError} INTERNAL_SERVER_ERROR - If processing fails
   *
   * @example
   * ```typescript
   * // Request
   * const result = await client.hello.hello.query({ text: "World" });
   * // Response: { greeting: "hello World" }
   * ```
   */
  hello: createRateLimitedProtectedProcedure("read")
    .input(helloInputSchema)
    .output(helloOutputSchema)
    .query((opts) => {
      const userId = opts.ctx.userId as string | undefined;
      const requestId = opts.ctx.requestId;

      try {
        logger.debug(
          { userId, requestId, textLength: opts.input.text.length },
          "Processing hello request",
        );

        const sanitizedText = escapeHtml(opts.input.text);

        logger.info(
          { userId, requestId },
          "Hello request completed successfully",
        );

        return {
          greeting: `hello ${sanitizedText}`,
        };
      } catch (error) {
        logger.error(
          {
            userId,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          },
          "Hello request failed",
        );
        throw createApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Failed to process hello request",
          error,
        );
      }
    }),
});
