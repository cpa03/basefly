import { Skeleton } from "@saasfly/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div
      className="container py-6 lg:py-12"
      aria-busy="true"
      aria-label="Loading blog post"
    >
      <article className="mx-auto max-w-3xl">
        <header className="space-y-4 pb-8">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-3 pt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </header>

        <Skeleton className="mb-8 h-64 w-full rounded-lg md:h-96" />

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />

          <div className="py-4">
            <Skeleton className="mb-4 h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <Skeleton className="h-40 w-full rounded-md" />

          <div className="py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </article>
    </div>
  );
}
