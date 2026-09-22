import { CARD_SKELETON_TOKENS } from "@saasfly/common";
import { Card, CardContent, CardFooter, CardHeader } from "@saasfly/ui/card";
import { Skeleton } from "@saasfly/ui/skeleton";

export interface CardSkeletonProps {
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export function CardSkeleton({
  className,
  role,
  "aria-label": ariaLabel,
}: CardSkeletonProps = {}) {
  return (
    <Card
      role={role ?? CARD_SKELETON_TOKENS.defaultRole}
      aria-label={ariaLabel ?? CARD_SKELETON_TOKENS.defaultAriaLabel}
      className={className}
    >
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-1/5" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="h-10" />
      <CardFooter>
        <Skeleton className="h-8 w-[120px]" />
      </CardFooter>
    </Card>
  );
}
