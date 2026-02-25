"use client";

import React, { useEffect, useMemo, useState, type ReactElement } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ANIMATION_TIMING } from "@saasfly/common";

export const AnimatedList = React.memo(
  ({
    className,
    children,
    delay = ANIMATION_TIMING.normal * 5, // Default: 1000ms (5 * 200ms)
  }: {
    className?: string;
    children: React.ReactNode;
    delay?: number;
  }) => {
    const shouldReduceMotion = useReducedMotion();
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
      // For reduced motion: skip the interval animation
      if (shouldReduceMotion) return;

      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
      }, delay);

      return () => clearInterval(interval);
    }, [childrenArray.length, delay, shouldReduceMotion]);

    // For reduced motion: show all items immediately without animation
    const itemsToShow = useMemo(
      () =>
        shouldReduceMotion
          ? childrenArray
          : childrenArray.slice(0, index + 1).reverse(),
      [index, childrenArray, shouldReduceMotion],
    );

    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <AnimatePresence mode="popLayout">
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as ReactElement).key} shouldReduceMotion={shouldReduceMotion}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedList.displayName = "AnimatedList";

export function AnimatedListItem({
  children,
  shouldReduceMotion = false,
}: {
  children: React.ReactNode;
  shouldReduceMotion?: boolean;
}) {
  // Simplified animations for reduced motion
  const animations = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, originY: 0 },
        exit: { scale: 0, opacity: 0 },
        transition: { type: "spring", stiffness: 350, damping: 40 },
      };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}
