import { cn } from "@saasfly/ui";
import { Skeleton } from "@saasfly/ui/skeleton";

export function ClusterConfigSkeleton() {
  return (
    <div
      className="w-full"
      aria-busy="true"
      aria-label="Loading cluster configuration"
    >
      <div className="space-y-6 rounded-lg border p-6">
        <div className="space-y-2">
          <Skeleton
            className={cn(
              "h-6 w-40",
              "motion-safe:animate-pulse",
              "motion-reduce:animate-none motion-reduce:bg-muted",
            )}
          />
          <Skeleton
            className={cn(
              "h-4 w-64",
              "motion-safe:animate-pulse",
              "motion-reduce:animate-none motion-reduce:bg-muted",
            )}
          />
        </div>
        <div className="grid w-full gap-4">
          <div className="flex flex-col space-y-1.5">
            <Skeleton
              className={cn(
                "h-4 w-16",
                "motion-safe:animate-pulse",
                "motion-reduce:animate-none motion-reduce:bg-muted",
              )}
            />
            <Skeleton
              className={cn(
                "h-10 w-full max-w-md",
                "motion-safe:animate-pulse",
                "motion-reduce:animate-none motion-reduce:bg-muted",
              )}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Skeleton
              className={cn(
                "h-4 w-16",
                "motion-safe:animate-pulse",
                "motion-reduce:animate-none motion-reduce:bg-muted",
              )}
            />
            <Skeleton
              className={cn(
                "h-10 w-full max-w-md",
                "motion-safe:animate-pulse",
                "motion-reduce:animate-none motion-reduce:bg-muted",
              )}
            />
          </div>
        </div>
        <Skeleton
          className={cn(
            "h-10 w-28",
            "motion-safe:animate-pulse",
            "motion-reduce:animate-none motion-reduce:bg-muted",
          )}
        />
      </div>
    </div>
  );
}