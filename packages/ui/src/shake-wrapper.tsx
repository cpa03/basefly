"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ANIMATION } from "@saasfly/common";

import { cn } from "./utils/cn";

interface ShakeWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to trigger the shake animation */
  shake?: boolean;
  /** Callback when shake animation completes */
  onShakeComplete?: () => void;
}

/**
 * ShakeWrapper - A component that provides shake animation for form validation errors.
 *
 * This component wraps form items and provides a subtle horizontal shake animation
 * when validation errors occur. It respects the user's motion preferences and will
 * not animate if reduced motion is preferred.
 *
 * @example
 * ```tsx
 * <ShakeWrapper shake={!!error}>
 *   <Input {...props} />
 * </ShakeWrapper>
 * ```
 */
const ShakeWrapper = React.forwardRef<HTMLDivElement, ShakeWrapperProps>(
  ({ className, shake = false, onShakeComplete, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const [isShaking, setIsShaking] = React.useState(false);

    React.useEffect(() => {
      if (shake && !shouldReduceMotion) {
        setIsShaking(true);
        const timer = setTimeout(() => {
          setIsShaking(false);
          onShakeComplete?.();
        }, ANIMATION.shake.duration * 1000);

        return () => clearTimeout(timer);
      }
    }, [shake, shouldReduceMotion, onShakeComplete]);

    // If reduced motion is preferred, render without animation
    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        animate={
          isShaking
            ? {
                x: ANIMATION.shake.keyframes.x,
              }
            : { x: 0 }
        }
        transition={ANIMATION.shake.transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

ShakeWrapper.displayName = "ShakeWrapper";

export { ShakeWrapper };
export type { ShakeWrapperProps };
