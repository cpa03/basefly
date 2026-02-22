import { Z_INDEX } from "@saasfly/common";
import { Skeleton } from "@saasfly/ui/skeleton";

/**
 * NavbarSkeleton - A delightful loading state for the navigation bar
 *
 * This component provides a smooth skeleton loading experience that:
 * - Maintains layout stability (prevents content jumping)
 * - Includes proper accessibility attributes
 * - Respects motion preferences (reduced motion support)
 * - Provides visual feedback during async navbar loading
 */
export function NavbarSkeleton() {
  return (
    <header
      className={`sticky top-0 ${Z_INDEX.navbar} flex w-full justify-center border-b border-border bg-background/60 backdrop-blur-xl`}
      aria-busy="true"
      aria-label="Loading navigation"
    >
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo area */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg motion-safe:animate-pulse motion-reduce:animate-none" />
          <Skeleton className="h-6 w-24 motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>

        {/* Navigation links skeleton */}
        <nav className="hidden gap-6 md:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-5 w-16 motion-safe:animate-pulse motion-reduce:animate-none"
            />
          ))}
        </nav>

        {/* Right side elements */}
        <div className="flex items-center space-x-3">
          {/* Divider */}
          <div className="hidden h-8 w-[1px] bg-accent md:block" aria-hidden="true" />

          {/* GitHub star placeholder */}
          <Skeleton className="hidden h-8 w-20 motion-safe:animate-pulse motion-reduce:animate-none md:block" />

          {/* Locale change placeholder */}
          <Skeleton className="h-8 w-10 motion-safe:animate-pulse motion-reduce:animate-none" />

          {/* Login button placeholder */}
          <Skeleton className="hidden h-9 w-20 motion-safe:animate-pulse motion-reduce:animate-none sm:block" />

          {/* Signup button placeholder */}
          <Skeleton className="h-9 w-20 motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </header>
  );
}
