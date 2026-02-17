import { getCurrentUser } from "@saasfly/auth";
import { PAGE_METADATA } from "@saasfly/common";

import { PricingCards } from "~/components/price/pricing-cards";
import { PricingFaq } from "~/components/price/pricing-faq";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: PAGE_METADATA.pricing,
};

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
  let subscriptionPlan;

  if (user) {
    try {
      const { trpc } = await import("~/trpc/server");
      subscriptionPlan = await trpc.stripe.userPlans.query();
    } catch (error) {
      console.error("Failed to fetch user subscription plan:", error);
      subscriptionPlan = undefined;
    }
  }
  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <PricingCards
        userId={user?.id}
        subscriptionPlan={subscriptionPlan}
        dict={dict.price}
        params={{ lang }}
      />
      <hr className="container" />
      <PricingFaq params={{ lang }} dict={dict.price} />
    </div>
  );
}
