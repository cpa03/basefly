import { Skeleton } from "@saasfly/ui/skeleton";

export default function LoginLoading() {
  return (
    <main
      className="container flex min-h-screen w-screen flex-col items-center justify-center"
      aria-busy="true"
      aria-label="Loading login page"
    >
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-48" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex flex-col space-y-2">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-4 w-24" />
        </div>
      </div>
    </main>
  );
}
