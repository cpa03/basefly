import type { Stripe } from "stripe";
import { CircuitBreaker, safeStripeCall } from "./integration";
import { stripe } from "./index";

const stripeCircuitBreaker = new CircuitBreaker("Stripe", 5, 60000);

function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

export async function createBillingSession(customerId: string, returnUrl: string) {
  return safeStripeCall(
    () =>
      stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      }),
    {
      serviceName: "Stripe Billing Portal",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: 3,
      timeoutMs: 30000,
    },
  );
}

export async function createCheckoutSession(
  params: Stripe.Checkout.SessionCreateParams,
  idempotencyKey?: string,
) {
  const key = idempotencyKey || generateIdempotencyKey("checkout_session");

  return safeStripeCall(
    () =>
      stripe.checkout.sessions.create(params, {
        idempotencyKey: key,
      }),
    {
      serviceName: "Stripe Checkout",
      circuitBreaker: stripeCircuitBreaker,
      maxAttempts: 3,
      timeoutMs: 30000,
    },
  );
}

export async function retrieveSubscription(subscriptionId: string) {
  return safeStripeCall(() => stripe.subscriptions.retrieve(subscriptionId), {
    serviceName: "Stripe Subscriptions",
    circuitBreaker: stripeCircuitBreaker,
    maxAttempts: 3,
    timeoutMs: 30000,
  });
}
