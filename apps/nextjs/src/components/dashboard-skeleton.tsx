import { Skeleton } from "@saasfly/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="divide-y divide-border rounded-md border">
        <div className="flex items-center justify-between p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {Array.from({ length: 6 }).map((_, i) => (
                  <th
                    key={i}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <Skeleton
                        className={
                          colIndex === 5
                            ? "h-10 w-20 ml-auto"
                            : "h-5 w-full max-w-[150px]"
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
