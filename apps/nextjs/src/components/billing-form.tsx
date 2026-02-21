"use client";

import * as React from "react";

import {
  FORM_DESCRIPTIONS,
  FORM_LABELS,
  TOAST_MESSAGES,
} from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import { toast } from "@saasfly/ui/use-toast";

import { formatDate } from "~/lib/utils";
import { UserSubscriptionPlan } from "~/types";

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: UserSubscriptionPlan & {
    isCanceled: boolean;
  };
}

export function BillingForm({
  subscriptionPlan,
  className,
  ...props
}: BillingFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setIsLoading(true);

    // Get a Stripe session URL.
    const response = await fetch("/api/users/stripe");

    if (!response?.ok) {
      setIsLoading(false);
      return toast({
        title: TOAST_MESSAGES.error.somethingWentWrong,
        description: TOAST_MESSAGES.error.refreshAndTryAgain,
        variant: "destructive",
      });
    }

    // Redirect to the Stripe session.
    // This could be a checkout page for initial upgrade.
    // Or portal to manage existing subscription.
    const session = await response.json();
    if (session) {
      window.location.href = session.url;
    }
  }

  return (
    <form className={cn(className)} onSubmit={onSubmit} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{FORM_LABELS.subscriptionPlan}</CardTitle>
          <CardDescription>
            {FORM_DESCRIPTIONS.currentPlan} <strong>{subscriptionPlan?.title}</strong>{" "}
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent>{subscriptionPlan?.description}</CardContent>
        <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
          <Button type="submit" isLoading={isLoading}>
            {subscriptionPlan?.isPaid
              ? FORM_LABELS.manageSubscription
              : FORM_LABELS.upgradeToPro}
          </Button>
          {subscriptionPlan?.isPaid ? (
            <p className="rounded-full text-xs font-medium">
              {subscriptionPlan?.isCanceled
                ? FORM_LABELS.planCancelsOn
                : FORM_LABELS.planRenewsOn}
              {formatDate(subscriptionPlan?.stripeCurrentPeriodEnd)}.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  );
}
