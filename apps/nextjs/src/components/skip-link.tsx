"use client";

import * as React from "react";

import { SKIP_LINK_TOKENS } from "@saasfly/common";
import { Z_INDEX } from "@saasfly/common/config/ui";
import { cn } from "@saasfly/ui";

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The ID of the main content element to skip to
   * @default SKIP_LINK_TOKENS.defaultTargetId ("main-content")
   */
  targetId?: string;
  /**
   * The text displayed for the skip link
   * @default SKIP_LINK_TOKENS.defaultText ("Skip to main content")
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
      targetId = SKIP_LINK_TOKENS.defaultTargetId,
      children = SKIP_LINK_TOKENS.defaultText,
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
          SKIP_LINK_TOKENS.base,
          Z_INDEX.skipLink,
          SKIP_LINK_TOKENS.animations.focusScale,
          SKIP_LINK_TOKENS.animations.activeScale,
          SKIP_LINK_TOKENS.animations.transition,
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
