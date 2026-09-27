"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { COLOURFUL_TEXT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface ColourfulTextProps {
  text: string;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export function ColourfulText({
  text,
  className,
  role = COLOURFUL_TEXT_TOKENS.defaultRole,
  "aria-label": ariaLabel,
}: ColourfulTextProps) {
  const colors = COLOURFUL_TEXT_TOKENS.colors;
  const shouldReduceMotion = useReducedMotion();

  const [currentColors, setCurrentColors] = React.useState<string[]>([
    ...colors,
  ]);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // Skip animation interval if user prefers reduced motion
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, COLOURFUL_TEXT_TOKENS.intervalMs);

    return () => clearInterval(interval);
  }, [colors, shouldReduceMotion]);

  return (
    <span
      role={role}
      aria-label={ariaLabel ?? (text !== "" ? text : COLOURFUL_TEXT_TOKENS.defaultAriaLabel)}
      tabIndex={0}
      className={cn(
        COLOURFUL_TEXT_TOKENS.container.base,
        COLOURFUL_TEXT_TOKENS.container.focusRing,
        className,
      )}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${count}-${index}`}
          initial={{
            y: 0,
          }}
          animate={
            shouldReduceMotion
              ? { color: currentColors[index % currentColors.length] }
              : {
                  color: currentColors[index % currentColors.length],
                  y: [0, -3, 0],
                  scale: [1, 1.01, 1],
                  filter: ["blur(0px)", "blur(5px)", "blur(0px)"],
                  opacity: [1, 0.8, 1],
                }
          }
          transition={
            shouldReduceMotion
              ? {}
              : {
                  duration: COLOURFUL_TEXT_TOKENS.animation.duration,
                  delay: index * COLOURFUL_TEXT_TOKENS.animation.staggerDelay,
                }
          }
          className={COLOURFUL_TEXT_TOKENS.charClass}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
