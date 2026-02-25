import { Skeleton } from "@saasfly/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="flex w-full flex-col gap-8 py-8 md:py-12">
      <section className="container flex flex-col items-center">
        <div className="mx-auto flex w-full flex-col items-center gap-5">
          <Skeleton className="mb-2 h-4 w-1/12" />
          <Skeleton className="h-10 w-2/6" />
        </div>
      </section>

      <section className="container">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <article
              key={i}
              className="group relative flex flex-col space-y-3 rounded-lg border p-5 shadow-sm"
              aria-busy="true"
            >
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
