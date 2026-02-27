import { Skeleton } from "@saasfly/ui/skeleton";

export function PricingCardsSkeleton() {
  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mb-10 flex w-full flex-col gap-5">
        <Skeleton className="mx-auto h-6 w-32" />
        <Skeleton className="mx-auto h-12 w-64 md:h-16 md:w-96" />
      </div>

      <div className="mb-4 flex items-center gap-5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-10 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative flex flex-col overflow-hidden rounded-xl border"
          >
            <div className="min-h-[150px] items-start space-y-4 bg-secondary/70 p-6">
              <Skeleton className="h-5 w-20" />
              <div className="flex flex-row">
                <div className="flex items-end">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mb-1 ml-2 h-4 w-8" />
                </div>
              </div>
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex h-full flex-col justify-between gap-16 p-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
