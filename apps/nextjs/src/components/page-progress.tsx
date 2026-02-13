"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@saasfly/ui";

interface PageProgressProps {
  color?: string;
  height?: number;
  delay?: number;
  className?: string;
}

const PageProgress = React.forwardRef<HTMLDivElement, PageProgressProps>(
  ({ color = "bg-primary", height = 3, delay = 100, className }, ref) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = React.useState(0);
    const [isVisible, setIsVisible] = React.useState(false);
    const progressRef = React.useRef(0);
    const animationRef = React.useRef<number | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const startProgress = React.useCallback(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setIsVisible(true);
      progressRef.current = 0;
      setProgress(0);

      const animate = () => {
        const remaining = 90 - progressRef.current;
        const increment = remaining * 0.05;

        progressRef.current = Math.min(progressRef.current + increment, 90);
        setProgress(progressRef.current);

        if (progressRef.current < 90) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      timeoutRef.current = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
    }, [delay]);

    const completeProgress = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      progressRef.current = 100;
      setProgress(100);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          progressRef.current = 0;
          setProgress(0);
        }, 300);
      }, 200);
    }, []);

    React.useEffect(() => {
      startProgress();

      const timer = setTimeout(() => {
        completeProgress();
      }, 50);

      return () => {
        clearTimeout(timer);
      };
    }, [pathname, searchParams, startProgress, completeProgress]);

    React.useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label="Page loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-live="polite"
        aria-hidden={!isVisible}
        className={cn(
          "fixed left-0 top-0 z-[9999]",
          "origin-left",
          "transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
          "motion-safe:transition-transform",
          className,
        )}
        style={{
          width: `${progress}%`,
          height: `${height}px`,
        }}
      >
        <div
          className={cn(
            "h-full w-full rounded-r-full",
            color,
            "shadow-[0_0_10px_rgba(var(--primary),0.5)]",
            "motion-safe:animate-pulse",
          )}
        />
      </div>
    );
  },
);

PageProgress.displayName = "PageProgress";

function PageProgressBar(props: PageProgressProps) {
  return (
    <Suspense fallback={null}>
      <PageProgress {...props} />
    </Suspense>
  );
}

export { PageProgress, PageProgressBar, type PageProgressProps };
