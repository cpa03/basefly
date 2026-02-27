import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";

import { SubscriptionCardSkeleton } from "~/components/billing/subscription-card-skeleton";
import { UsageCardSkeleton } from "~/components/billing/usage-card-skeleton";
import { DashboardShell } from "~/components/shell";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import { trpc } from "~/trpc/server";
import { SubscriptionForm } from "./subscription-form";

export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
};

export const dynamic = "force-dynamic";

interface Subscription {
  plan: string | null;
  endsAt: Date | null;
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{
    lang: Locale;
  }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <DashboardShell
      title={dict.business.billing.billing}
      description={dict.business.billing.content}
      className="space-y-4"
    >
      <Suspense
        fallback={<SubscriptionCardSkeleton dict={dict.business.billing} />}
      >
        <SubscriptionCard dict={dict.business.billing} />
      </Suspense>

      <Suspense fallback={<UsageCardSkeleton dict={dict.business.billing} />}>
        <UsageCard dict={dict.business.billing} />
      </Suspense>
    </DashboardShell>
  );
}

function SubscriptionContent({
  subscription,
  dict,
}: {
  subscription: Subscription;
  dict: Record<string, string>;
}) {
  if (subscription.plan && subscription.endsAt) {
    return (
      <p>
        {dict.subscriptionInfoPrefix} <strong>{subscription.plan}</strong>{" "}
        {dict.subscriptionInfoPlan}
        {dict.subscriptionInfoRenew}{" "}
        <strong>{subscription.endsAt.toLocaleDateString()}</strong>.
      </p>
    );
  }
  return null;
}

async function SubscriptionCard({ dict }: { dict: Record<string, string> }) {
  const subscription = (await trpc.auth.mySubscription.query()) as Subscription;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.subscription}</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <SubscriptionContent subscription={subscription} dict={dict} />
        ) : (
          <p>{dict.noSubscription}</p>
        )}
      </CardContent>
      <CardFooter>
        <SubscriptionForm hasSubscription={!!subscription} dict={dict} />
      </CardFooter>
    </Card>
  );
}

function UsageCard({ dict }: { dict: Record<string, string> }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{dict.usage}</CardTitle>
      </CardHeader>
      <CardContent>{dict.no_usage}</CardContent>
    </Card>
  );
}
