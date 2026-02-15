"use client";

import * as React from "react";

import { ANIMATION } from "@saasfly/common";

interface UseFormErrorScrollOptions {
  /**
   * Delay in milliseconds before scrolling to error
   * @default 100
   */
  delay?: number;
  /**
   * Offset from the top of the viewport in pixels
   * @default 100
   */
  offset?: number;
  /**
   * Behavior of the scroll animation
   * @default "smooth"
   */
  behavior?: ScrollBehavior;
  /**
   * Whether to focus the element after scrolling
   * @default true
   */
  focus?: boolean;
}

/**
 * useFormErrorScroll - A micro-UX hook for automatic scroll-to-error behavior
 *
 * Automatically scrolls to and focuses the first form field with a validation error.
 * This improves accessibility and user experience by ensuring users immediately
 * see what needs to be corrected when form validation fails.
 *
 * Features:
 * - Smooth scroll to first error field
 * - Auto-focus on the error field for keyboard users
 * - Configurable delay, offset, and behavior
 * - Respects reduced motion preferences
 * - Type-safe integration with react-hook-form and other form libraries
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * const { formState: { errors } } = useForm();
 * const scrollToError = useFormErrorScroll();
 *
 * useEffect(() => {
 *   scrollToError(errors);
 * }, [errors, scrollToError]);
 * ```
 */
export function useFormErrorScroll(options: UseFormErrorScrollOptions = {}) {
  const {
    delay = 100,
    offset = 100,
    behavior = "smooth",
    focus = true,
  } = options;

  const scrollToError = React.useCallback(
    (errors: Record<string, unknown>) => {
      if (!errors || Object.keys(errors).length === 0) {
        return;
      }

      // Get the first error field name
      const firstErrorField = Object.keys(errors)[0];
      if (!firstErrorField) {
        return;
      }

      // Find the input element with that name or id
      const errorElement =
        document.querySelector(`[name="${firstErrorField}"]`) ??
        document.getElementById(firstErrorField) ??
        document.querySelector(`[aria-describedby*="${firstErrorField}"]`);

      if (!errorElement) {
        return;
      }

      // Use setTimeout to allow the DOM to update with error states
      setTimeout(() => {
        // Calculate position with offset
        const elementRect = errorElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.scrollY;
        const scrollPosition = absoluteElementTop - offset;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        // Scroll to the element
        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: prefersReducedMotion ? "auto" : behavior,
        });

        // Focus the element if it's a form control and focus is enabled
        if (focus && errorElement instanceof HTMLElement) {
          // Small delay to ensure scroll completes
          setTimeout(() => {
            errorElement.focus({ preventScroll: true });
          }, prefersReducedMotion ? 0 : parseInt(ANIMATION.duration.normal));
        }
      }, delay);
    },
    [delay, offset, behavior, focus],
  );

  return scrollToError;
}

export type { UseFormErrorScrollOptions };
