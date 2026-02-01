import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { handleEvent, stripe } from "@saasfly/stripe";

import { env } from "~/env.mjs";
import { logger } from "~/lib/logger";

const handler = async (req: NextRequest) => {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    ) as Stripe.Event;
    await handleEvent(event);

    logger.info("Handled Stripe Event", { eventType: event.type });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error when handling Stripe Event", error, { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export { handler as GET, handler as POST };
