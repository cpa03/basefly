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

async function getSubscriptionPlan() {
  "use server";
  const user = await getCurrentUser();
  if (!user) {
    return undefined;
  }
  try {
    const { trpc } = await import("~/trpc/server");
    return await trpc.stripe.userPlans.query();
  } catch (error) {
    logger.error("Failed to fetch user subscription plan:", error);
    return undefined;
  }
}

interface PricingContentProps {
  userId?: string;
  dict: Record<string, string>;
  lang: Locale;
}

async function PricingContent({ userId, dict, lang }: PricingContentProps) {
  const subscriptionPlan = await getSubscriptionPlan();
  return (
    <PricingCards
      userId={userId}
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
  const user = await getCurrentUser();
  const dict = await getDictionary(lang);

  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <Suspense fallback={<PricingCardsSkeleton />}>
        {/* @ts-expect-error Server Component */}
        <PricingContent userId={user?.id} dict={dict.price} lang={lang} />
      </Suspense>
      <hr className="container" />
      <PricingFaq params={{ lang }} dict={dict.price} />
    </div>
  );
}
