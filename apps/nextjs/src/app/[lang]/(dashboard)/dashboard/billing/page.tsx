import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";

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
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);
  return (
    <DashboardShell
      title={dict.business.billing.billing}
      description={dict.business.billing.content}
      className="space-y-4"
    >
      <SubscriptionCard dict={dict.business.billing} />

      <UsageCard />
    </DashboardShell>
  );
}

function SubscriptionContent({ subscription }: { subscription: Subscription }) {
  if (subscription.plan && subscription.endsAt) {
    return (
      <p>
        You are currently on the <strong>{subscription.plan}</strong> plan.Your subscription will renew on <strong>{subscription.endsAt.toLocaleDateString()}</strong>.
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
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <SubscriptionContent subscription={subscription} />
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

function UsageCard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>None</CardContent>
    </Card>
  );
}
