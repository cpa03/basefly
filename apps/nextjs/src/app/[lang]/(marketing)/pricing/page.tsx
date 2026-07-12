import { Suspense } from "react";

import { getCurrentUser } from "@saasfly/auth";
import { PAGE_METADATA } from "@saasfly/common";

import { PricingCards } from "~/components/price/pricing-cards";
import { PricingCardsSkeleton } from "~/components/price/pricing-cards-skeleton";
import { PricingFaq } from "~/components/price/pricing-faq";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { logger } from "~/lib/logger";

export const metadata = {
  title: PAGE_METADATA.pricing,
};

async function PricingCardsWithData({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Record<string, string>;
}) {
  const user = await getCurrentUser();
  let subscriptionPlan;

  if (user) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- tRPC proxy types are dynamically resolved
      const { trpc } = await import("~/trpc/server");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- tRPC proxy types are dynamically resolved
      subscriptionPlan = await trpc.stripe.userPlans();
    } catch (error) {
      logger.error("Failed to fetch user subscription plan:", error);
      subscriptionPlan = undefined;
    }
  }

  return (
    <PricingCards
      userId={user?.id}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- tRPC proxy types are dynamically resolved
      subscriptionPlan={subscriptionPlan}
      dict={dict}
      params={{ lang }}
    />
  );
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{
    lang: Locale;
  }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <Suspense fallback={<PricingCardsSkeleton />}>
        <PricingCardsWithData lang={lang} dict={dict.price} />
      </Suspense>
      <hr className="container" />
      <PricingFaq params={{ lang }} dict={dict.price} />
    </div>
  );
}
