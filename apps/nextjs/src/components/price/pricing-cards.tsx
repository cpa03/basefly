"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

import { Button, buttonVariants } from "@saasfly/ui/button";
import { Check, Close } from "@saasfly/ui/icons";
import { Switch } from "@saasfly/ui/switch";

import { BillingFormButton } from "~/components/price/billing-form-button";
import {
  priceDataMap,
  type SubscriptionPlanTranslation,
} from "~/config/price/price-data";
import { siteConfig } from "~/config/site";
import { useSigninModal } from "~/hooks/use-signin-modal";
import { UserSubscriptionPlan } from "~/types";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
  dict: Record<string, string>;
  params: {
    lang: string;
  };
}

interface PricingCardProps {
  offer: SubscriptionPlanTranslation;
  isYearly: boolean;
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
  dict: Record<string, string>;
  onSignup: () => void;
}

const PricingCard = React.memo(function PricingCard({
  offer,
  isYearly,
  userId,
  subscriptionPlan,
  dict,
  onSignup,
}: PricingCardProps) {
  const displayPrice = useMemo(() => {
    if (isYearly && offer?.prices?.monthly > 0) {
      return {
        hasDiscount: true,
        originalPrice: `$${offer?.prices?.monthly}`,
        discountedPrice: `$${offer?.prices?.yearly / 12}`,
        billingInfo: `$${offer?.prices?.yearly} ${dict.annual_info}`,
      };
    }
    return {
      hasDiscount: false,
      originalPrice: `$${offer?.prices?.monthly}`,
      discountedPrice: `$${offer?.prices?.monthly}`,
      billingInfo: dict.monthly_info,
    };
  }, [isYearly, offer?.prices, dict]);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border">
      <div className="min-h-[150px] items-start space-y-4 bg-secondary/70 p-6">
        <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {offer?.title}
        </p>

        <div className="flex flex-row">
          <div className="flex items-end">
            <div className="flex text-left text-3xl font-semibold leading-6">
              {displayPrice.hasDiscount && (
                <span className="mr-2 text-muted-foreground line-through">
                  {displayPrice.originalPrice}
                </span>
              )}
              <span>{displayPrice.discountedPrice}</span>
            </div>
            <div className="-mb-1 ml-2 text-left text-sm font-medium">
              <div>{dict.mo}</div>
            </div>
          </div>
        </div>
        {offer.prices.monthly > 0 && (
          <div className="text-left text-sm text-muted-foreground">
            {displayPrice.billingInfo}
          </div>
        )}
      </div>

      <div className="flex h-full flex-col justify-between gap-16 p-6">
        <ul className="space-y-2 text-left text-sm font-medium leading-normal">
          {offer?.benefits.map((feature: string) => (
            <li className="flex items-start" key={feature}>
              <Check className="mr-3 h-5 w-5 shrink-0" />
              <p>{feature}</p>
            </li>
          ))}

          {offer?.limitations?.length > 0 &&
            offer.limitations.map((feature: string) => (
              <li
                className="flex items-start text-muted-foreground"
                key={feature}
              >
                <Close className="mr-3 h-5 w-5 shrink-0" />
                <p>{feature}</p>
              </li>
            ))}
        </ul>

        {userId && subscriptionPlan ? (
          offer?.id === "starter" ? (
            <Link
              href="/dashboard"
              className={buttonVariants({
                className: "w-full",
                variant: "default",
              })}
            >
              {dict.go_to_dashboard}
            </Link>
          ) : (
            <BillingFormButton
              year={isYearly}
              offer={offer}
              subscriptionPlan={subscriptionPlan}
              dict={dict}
            />
          )
        ) : (
          <Button onClick={onSignup}>{dict.signup}</Button>
        )}
      </div>
    </div>
  );
});

export function PricingCards({
  userId,
  subscriptionPlan,
  dict,
  params: { lang },
}: PricingCardsProps) {
  const isYearlyDefault = true;
  const [isYearly, setIsYearly] = useState<boolean>(isYearlyDefault);
  const signInModal = useSigninModal();
  const pricingData = useMemo(() => priceDataMap[lang] || [], [lang]);
  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };
  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mb-10 flex w-full flex-col gap-5">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {dict.pricing}
        </p>
        <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
          {dict.slogan}
        </h2>
      </div>

      <div className="mb-4 flex items-center gap-5">
        <span>{dict.monthly_bill}</span>
        <Switch
          checked={isYearly}
          onCheckedChange={toggleBilling}
          role="switch"
          aria-label="switch-year"
        />
        <span>{dict.annual_bill}</span>
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
        {pricingData.map((offer: SubscriptionPlanTranslation) => (
          <PricingCard
            key={offer?.title}
            offer={offer}
            isYearly={isYearly}
            userId={userId}
            subscriptionPlan={subscriptionPlan}
            dict={dict}
            onSignup={signInModal.onOpen}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-base text-muted-foreground">
        <Balancer>
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
            href={`mailto:${siteConfig.support.email}?subject=${encodeURIComponent(siteConfig.support.subject)}`}
          >
            {siteConfig.support.email}
          </a>{" "}
          {dict.contact}
          <br />
          <strong>{dict.contact_2}</strong>
        </Balancer>
      </p>
    </section>
  );
}
