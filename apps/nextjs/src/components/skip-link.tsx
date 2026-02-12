"use client";

import * as React from "react";

import { cn } from "@saasfly/ui";

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The ID of the main content element to skip to
   * @default "main-content"
   */
  targetId?: string;
  /**
   * The text displayed for the skip link
   * @default "Skip to main content"
   */
  children?: React.ReactNode;
}

/**
 * SkipLink - Accessibility component for keyboard navigation
 *
 * Allows keyboard users to bypass repetitive navigation and jump directly
 * to the main content. Essential for WCAG 2.2 Level A compliance (2.4.1 Bypass Blocks).
 *
 * Features:
 * - Visually hidden until focused
 * - Smooth transition animations (with reduced motion support)
 * - High contrast styling for visibility
 * - Focus management for keyboard navigation
 *
 * @example
 * ```tsx
 * <SkipLink />
 * <header>...</header>
 * <main id="main-content">...</main>
 * ```
 */
const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    {
      targetId = "main-content",
      children = "Skip to main content",
      className,
      ...props
    },
    ref,
  ) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: false });
          target.addEventListener(
            "blur",
            () => {
              target.removeAttribute("tabindex");
            },
            { once: true },
          );
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      [targetId],
    );

    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        onClick={handleClick}
        className={cn(
          "sr-only",
          "focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]",
          "focus:flex focus:items-center focus:rounded-md focus:bg-primary focus:px-4 focus:py-3",
          "focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "focus:border-2 focus:border-primary-foreground/20",
          "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = "SkipLink";

export { SkipLink, type SkipLinkProps };
