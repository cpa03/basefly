"use client";

import * as React from "react";

import {
  ANIMATION,
  SCROLL_DELAYS,
  SCROLL_OFFSETS,
  SCROLL_BEHAVIOR,
} from "@saasfly/common";

interface UseFormErrorScrollOptions {
  delay?: number;
  offset?: number;
  behavior?: ScrollBehavior;
  focus?: boolean;
}

export function useFormErrorScroll(options: UseFormErrorScrollOptions = {}) {
  const {
    delay = SCROLL_DELAYS.formError,
    offset = SCROLL_OFFSETS.formError,
    behavior = SCROLL_BEHAVIOR.formError,
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
          setTimeout(
            () => {
              errorElement.focus({ preventScroll: true });
            },
            prefersReducedMotion ? 0 : parseInt(ANIMATION.duration.normal),
          );
        }
      }, delay);
    },
    [delay, offset, behavior, focus],
  );

  return scrollToError;
}

export type { UseFormErrorScrollOptions };
