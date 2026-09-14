import type { ReactNode } from "react";
import { ANIMATED_GRADIENT_TEXT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  role?: string;
}

function AnimatedGradientText({
  children,
  className,
  "aria-label": ariaLabel,
  role = "group",
}: AnimatedGradientTextProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel ?? ANIMATED_GRADIENT_TEXT_TOKENS.defaultAriaLabel}
      className={cn(
        ANIMATED_GRADIENT_TEXT_TOKENS.container.base,
        ANIMATED_GRADIENT_TEXT_TOKENS.container.hoverScale,
        ANIMATED_GRADIENT_TEXT_TOKENS.container.activeScale,
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(ANIMATED_GRADIENT_TEXT_TOKENS.gradientOverlay.base)}
      />

      {children}
    </div>
  );
}

export { AnimatedGradientText };
