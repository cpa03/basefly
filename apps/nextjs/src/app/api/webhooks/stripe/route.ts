import { NextResponse, type NextRequest } from "next/server";

import {
  getLimiter,
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api";
import { HTTP_SECURITY_HEADERS, HTTP_STATUS } from "@saasfly/common";
import {
  getStripeClientOrThrow,
  handleEvent,
  isStripeConfigured,
} from "@saasfly/stripe";

import { env } from "~/env.mjs";
import { logger } from "~/lib/logger";

/**
 * Security headers for Stripe webhook responses
 * Prevents MIME sniffing and clickjacking on webhook responses
 */
const WEBHOOK_SECURITY_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
  "X-Frame-Options": HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
  // Security: Prevent search engines from indexing webhook endpoints
  "X-Robots-Tag": "noindex, nofollow, nosnippet, noarchive",
} as const;

// Vercel best practice: Set maxDuration for webhooks that may require
// longer processing time for database operations and external API calls
export const maxDuration = 60;

// Use stripe rate limit config: 10 requests per minute
const webhookLimiter = getLimiter("stripe");

/**
 * Rate limit headers to include in responses
 */
const getRateLimitHeaders = (result: {
  limit: number;
  remaining: number;
  resetAt: number;
}) => ({
  "X-RateLimit-Limit": result.limit.toString(),
  "X-RateLimit-Remaining": result.remaining.toString(),
  "X-RateLimit-Reset": result.resetAt.toString(),
});

const handler = async (req: NextRequest) => {
  const requestId = getOrGenerateRequestId(req.headers);

  // Rate limiting check - use a non-secret identifier
  const identifier = "stripe-webhook";

  const rateLimitResult = webhookLimiter.check(identifier);

  if (!rateLimitResult.success) {
    logger.warn(
      {
        identifier,
        requestId,
        resetAt: rateLimitResult.resetAt,
      },
      "Stripe webhook rate limit exceeded",
    );
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
          "Retry-After": Math.ceil(
            (rateLimitResult.resetAt - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  if (!isStripeConfigured()) {
    logger.error("Stripe is not configured, rejecting webhook");
    return NextResponse.json(
      { error: "Stripe not configured" },
      {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  }

  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!payload || payload.trim().length === 0) {
    logger.error("Empty Stripe webhook payload received");
    return NextResponse.json(
      { error: "Empty payload" },
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.error("Stripe webhook secret not configured");
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  }

  if (!signature) {
    logger.error("Missing Stripe-Signature header");
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  }

  try {
    const client = getStripeClientOrThrow();
    const event = client.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
    await handleEvent(event);

    logger.info("Handled Stripe Event", { eventType: event.type, requestId });
    return NextResponse.json(
      { received: true },
      {
        status: HTTP_STATUS.OK,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error when handling Stripe Event", error, {
      message,
      requestId,
    });
    return NextResponse.json(
      { error: message },
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: {
          ...WEBHOOK_SECURITY_HEADERS,
          [REQUEST_ID_HEADER]: requestId,
          ...getRateLimitHeaders(rateLimitResult),
        },
      },
    );
  }
};

export { handler as GET, handler as POST };
