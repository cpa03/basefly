import { NextResponse, type NextRequest } from "next/server";

import { HTTP_STATUS } from "@saasfly/common";
import { handleEvent, stripe } from "@saasfly/stripe";

import { env } from "~/env.mjs";
import { logger } from "~/lib/logger";

// Vercel best practice: Set maxDuration for webhooks that may require
// longer processing time for database operations and external API calls
export const maxDuration = 60;

const handler = async (req: NextRequest) => {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature");

  if (!signature) {
    logger.error("Missing Stripe-Signature header");
    return NextResponse.json(
      { error: "Missing Stripe-Signature header" },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
    await handleEvent(event);

    logger.info("Handled Stripe Event", { eventType: event.type });
    return NextResponse.json({ received: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error when handling Stripe Event", error, { message });
    return NextResponse.json(
      { error: message },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }
};

export { handler as GET, handler as POST };
