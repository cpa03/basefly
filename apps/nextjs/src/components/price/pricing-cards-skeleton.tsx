import { Skeleton } from "@saasfly/ui/skeleton";
import { Card, CardContent, CardHeader } from "@saasfly/ui/card";

export function PricingCardsSkeleton() {
  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mb-10 flex w-full flex-col gap-5">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-12 w-64" />
      </div>

      <div className="mb-4 flex items-center gap-5">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
