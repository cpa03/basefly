import type Stripe from "stripe";

import { db, SubscriptionPlan } from "@saasfly/db";

import { retrieveSubscription } from "./client";
import { IntegrationError } from "./integration";
import { logger } from "./logger";
import { getSubscriptionPlan } from "./plans";
import { executeIdempotentWebhook } from "./webhook-idempotency";

export async function handleEvent(event: Stripe.Event) {
  const eventId = event.id;
  const eventType = event.type;

  await executeIdempotentWebhook(eventId, eventType, async () =>
    processEventInternal(event),
  );
}

async function processEventInternal(event: Stripe.Event) {
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
    } else if (event.type === "customer.subscription.updated") {
      logger.info(`Unhandled event type: ${event.type}`);
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
  const subscription = await retrieveSubscription(
    session.subscription as string,
  );
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { userId } = subscription.metadata;
  if (!userId) {
    throw new IntegrationError(
      "Missing user id in metadata",
      "MISSING_USER_ID",
    );
  }

  const customer = await db
    .selectFrom("Customer")
    .selectAll()
    .where("authUserId", "=", userId)
    .executeTakeFirst();

  if (customer) {
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      logger.warn("No priceId in subscription for checkout.session.completed, skipping update");
      return;
    }

    await db
      .updateTable("Customer")
      .where("id", "=", customer.id)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
      })
      .execute();
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) {
    logger.warn("No subscription ID in invoice, skipping update");
    return;
  }

  const subscription = await retrieveSubscription(subscriptionId);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { userId } = subscription.metadata;
  if (!userId) {
    throw new IntegrationError(
      "Missing user id in metadata",
      "MISSING_USER_ID",
    );
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
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
    await db
      .updateTable("Customer")
      .where("id", "=", customer.id)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null,
        plan: plan || SubscriptionPlan.FREE,
      })
      .execute();
  }
}
