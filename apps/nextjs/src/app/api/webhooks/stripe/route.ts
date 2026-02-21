import { NextResponse, type NextRequest } from "next/server";

import {
  getOrGenerateRequestId,
  REQUEST_ID_HEADER,
} from "@saasfly/api/request-id";
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
} as const;

// Vercel best practice: Set maxDuration for webhooks that may require
// longer processing time for database operations and external API calls
export const maxDuration = 60;

const handler = async (req: NextRequest) => {
  const requestId = getOrGenerateRequestId(req.headers);

  if (!isStripeConfigured()) {
    logger.error("Stripe is not configured, rejecting webhook");
    return NextResponse.json(
      { error: "Stripe not configured" },
      {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
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
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.error("Stripe webhook secret not configured");
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
      },
    );
  }

  if (!signature) {
    logger.error("Missing Stripe-Signature header");
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
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
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error when handling Stripe Event", error, { message, requestId });
    return NextResponse.json(
      { error: message },
      {
        status: HTTP_STATUS.BAD_REQUEST,
        headers: { ...WEBHOOK_SECURITY_HEADERS, [REQUEST_ID_HEADER]: requestId },
      },
    );
  }
};

export { handler as GET, handler as POST };
