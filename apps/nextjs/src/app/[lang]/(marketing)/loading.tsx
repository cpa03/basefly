import { Skeleton } from "@saasfly/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div
      className="flex w-full flex-col"
      aria-busy="true"
      aria-label="Loading home page"
    >
      <section className="container">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <div className="flex h-full flex-col items-start">
            <div className="flex flex-col pt-4 md:pt-36 lg:pt-36 xl:pt-36">
              <div className="mt-20">
                <Skeleton className="mb-6 h-12 w-3/4 md:h-16" />
                <Skeleton className="h-16 w-24 md:h-20" />
              </div>

              <div className="mt-4">
                <Skeleton className="h-6 w-2/3 sm:w-96" />
              </div>

              <div className="mb-4 mt-6 flex w-full flex-col justify-center space-y-4 sm:flex-row sm:justify-start sm:space-x-8 sm:space-y-0">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-10 w-72 rounded-md" />
              </div>

              <div className="mt-4 flex w-full flex-col items-center justify-start xl:flex-row">
                <div className="flex">
                  <Skeleton className="h-10 w-64 rounded-full" />
                </div>
                <div className="ml-8 flex flex-col items-center justify-start gap-2">
                  <Skeleton className="h-5 w-80" />
                  <Skeleton className="h-5 w-80" />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden h-full w-full bg-background xl:block">
            <div className="flex flex-col pt-44">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-8 md:mt-[-180px] xl:mt-[-180px]">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </section>

      <section className="container pt-24">
        <div className="flex flex-col items-center justify-center pt-10">
          <Skeleton className="h-6 w-24" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="container pt-8">
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </section>

      <section className="w-full px-8 pt-10 sm:px-0 sm:pt-24 md:px-0 md:pt-24 xl:px-0 xl:pt-24">
        <div className="flex h-full w-full flex-col items-center pb-[100px] pt-10">
          <Skeleton className="mb-6 h-10 w-64 md:h-12" />
          <Skeleton className="mb-6 h-6 w-80" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </section>
    </div>
  );
}
