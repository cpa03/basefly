import { Card, CardContent, CardHeader, CardTitle } from "@saasfly/ui/card";

interface UsageCardSkeletonProps {
  dict: {
    usage: string;
  };
}

export function UsageCardSkeleton({ dict }: UsageCardSkeletonProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{dict.usage}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
