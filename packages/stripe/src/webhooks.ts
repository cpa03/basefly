import type Stripe from "stripe";

import { db, SubscriptionPlan } from "@saasfly/db";

import { IntegrationError } from "./integration";
import { retrieveSubscription } from "./client";
import { getSubscriptionPlan } from "./plans";

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info", msg, ...meta })),
  warn: (msg: string, meta?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn", msg, ...meta })),
  error: (msg: string, err?: Error | unknown, meta?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", msg, error: err, ...meta })),
};

export async function handleEvent(event: Stripe.Event) {
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(session);
    } else if (event.type === "invoice.payment_succeeded") {
      await handleInvoicePaymentSucceeded(session);
    } else if (event.type === "customer.subscription.updated") {
      logger.info("customer.subscription.updated", { eventType: event.type });
    }
    logger.info("Stripe Webhook Processed", { eventType: event.type });
  } catch (error) {
    logger.error("Stripe Webhook Failed", error);

    if (error instanceof IntegrationError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new IntegrationError(
        `Webhook processing failed: ${error.message}`,
        "WEBHOOK_ERROR",
        error,
      );
    }

    throw new IntegrationError(
      "Webhook processing failed: Unknown error",
      "WEBHOOK_ERROR",
      error,
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const subscription = await retrieveSubscription(session.subscription as string);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { userId } = subscription.metadata;
  if (!userId) {
    throw new IntegrationError("Missing user id in metadata", "MISSING_USER_ID");
  }

  const customer = await db
    .selectFrom("Customer")
    .selectAll()
    .where("authUserId", "=", userId)
    .executeTakeFirst();

  if (customer) {
    await db
      .updateTable("Customer")
      .where("id", "=", customer.id)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
      })
      .execute();
  }
}

async function handleInvoicePaymentSucceeded(
  session: Stripe.Checkout.Session,
) {
  const subscription = await retrieveSubscription(session.subscription as string);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { userId } = subscription.metadata;
  if (!userId) {
    throw new IntegrationError("Missing user id in metadata", "MISSING_USER_ID");
  }

  const customer = await db
    .selectFrom("Customer")
    .selectAll()
    .where("authUserId", "=", userId)
    .executeTakeFirst();

  if (customer) {
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      logger.warn("No priceId in subscription, skipping update");
      return;
    }

    const plan = getSubscriptionPlan(priceId);
    await db
      .updateTable("Customer")
      .where("id", "=", customer.id)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        plan: plan || SubscriptionPlan.FREE,
      })
      .execute();
  }
}
