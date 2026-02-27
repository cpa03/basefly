import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";

interface SubscriptionCardSkeletonProps {
  dict: {
    subscription: string;
    noSubscription: string;
    upgrade: string;
  };
}

export function SubscriptionCardSkeleton({
  dict,
}: SubscriptionCardSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.subscription}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}
