"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";
import { ANIMATION } from "@saasfly/common";

interface BackToTopProps {
  /**
   * Scroll threshold in pixels before showing the button
   * @default 400
   */
  threshold?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Position of the button
   * @default "bottom-right"
   */
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

/**
 * BackToTop - A micro-UX component for quick navigation to page top
 *
 * Features:
 * - Appears when user scrolls past threshold
 * - Smooth scroll animation
 * - Keyboard accessible (Enter/Space to activate)
 * - Respects reduced motion preferences
 * - Tooltip with keyboard shortcut hint
 * - Animates in/out with fade and scale
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BackToTop />
 *
 * // Custom threshold (show after 200px scroll)
 * <BackToTop threshold={200} />
 *
 * // Different position
 * <BackToTop position="bottom-left" />
 * ```
 */
const BackToTop = React.forwardRef<HTMLButtonElement, BackToTopProps>(
  ({ threshold = 400, className, position = "bottom-right" }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    // Track scroll position
    React.useEffect(() => {
      const toggleVisibility = () => {
        // Use requestAnimationFrame for performance
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > threshold);
        });
      };

      // Check initial position
      toggleVisibility();

      window.addEventListener("scroll", toggleVisibility, { passive: true });

      return () => {
        window.removeEventListener("scroll", toggleVisibility);
      };
    }, [threshold]);

    // Handle keyboard shortcut (Home key)
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl/Cmd + Home to scroll to top
        if ((e.ctrlKey || e.metaKey) && e.key === "Home") {
          e.preventDefault();
          scrollToTop();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const scrollToTop = React.useCallback(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, []);

    // Position classes
    const positionClasses = {
      "bottom-right": "right-4 sm:right-8",
      "bottom-left": "left-4 sm:left-8",
      "bottom-center": "left-1/2 -translate-x-1/2",
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              variant="secondary"
              size="icon"
              onClick={scrollToTop}
              className={cn(
                // Positioning
                "fixed bottom-4 sm:bottom-8 z-50",
                positionClasses[position],
                // Size
                "h-10 w-10 sm:h-12 sm:w-12",
                // Visual styling
                "rounded-full shadow-lg",
                "bg-background/80 backdrop-blur-sm border",
                "hover:bg-background hover:shadow-xl",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                // Animation
                "transition-all",
                ANIMATION.duration.normal,
                ANIMATION.easing.default,
                // Visibility states with motion-safe
                "motion-safe:transition-all",
                isVisible
                  ? "motion-safe:opacity-100 motion-safe:scale-100 pointer-events-auto"
                  : "motion-safe:opacity-0 motion-safe:scale-75 pointer-events-none",
                // Reduced motion fallback
                "opacity-0 scale-75 pointer-events-none",
                isVisible && "opacity-100 scale-100 pointer-events-auto",
                className,
              )}
              aria-label="Back to top (Ctrl+Home)"
              aria-hidden={!isVisible}
            >
              <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <p>Back to top</p>
            <p className="text-xs text-muted-foreground">Ctrl + Home</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

BackToTop.displayName = "BackToTop";

export { BackToTop, type BackToTopProps };
