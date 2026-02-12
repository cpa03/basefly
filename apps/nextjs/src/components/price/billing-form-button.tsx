"use client";

import { useTransition } from "react";

import { Button } from "@saasfly/ui/button";
import { Spinner } from "@saasfly/ui/icons";

import { trpc } from "~/trpc/client";
import type { SubscriptionPlan, UserSubscriptionPlan } from "~/types";

interface BillingFormButtonProps {
  offer: SubscriptionPlan;
  subscriptionPlan: UserSubscriptionPlan;
  year: boolean;
  dict: Record<string, string>;
}

export function BillingFormButton({
  year,
  offer,
  dict,
  subscriptionPlan,
}: BillingFormButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function createSession(planId: string) {
    const res = await trpc.stripe.createSession.mutate({ planId: planId });
    if (res?.url) window.location.href = res?.url;
  }

  const stripePlanId = year
    ? offer?.stripeIds?.yearly
    : offer?.stripeIds?.monthly;

  const stripeSessionAction = () =>
    startTransition(async () => await createSession(stripePlanId!));

  const buttonText = subscriptionPlan.stripePriceId
    ? dict.manage_subscription
    : dict.upgrade;

  return (
    <Button
      variant="default"
      className="relative w-full overflow-hidden"
      disabled={isPending}
      onClick={stripeSessionAction}
      aria-busy={isPending}
      aria-live="polite"
    >
      <span
        className={`flex items-center justify-center transition-all duration-200 ease-out ${
          isPending ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"
        }`}
        aria-hidden={isPending}
      >
        {buttonText}
      </span>

      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
          isPending ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
        aria-hidden={!isPending}
      >
        <Spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        <span>Loading...</span>
      </span>
    </Button>
  );
}
