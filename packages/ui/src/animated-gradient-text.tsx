import type { HTMLAttributes, ReactNode } from "react";
import { ANIMATED_GRADIENT_TEXT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface AnimatedGradientTextProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

function AnimatedGradientText({
  children,
  className,
  role = ANIMATED_GRADIENT_TEXT_TOKENS.defaultRole,
  "aria-label": ariaLabel = ANIMATED_GRADIENT_TEXT_TOKENS.defaultAriaLabel,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn(
        ANIMATED_GRADIENT_TEXT_TOKENS.container.base,
        ANIMATED_GRADIENT_TEXT_TOKENS.container.hoverScale,
        ANIMATED_GRADIENT_TEXT_TOKENS.container.activeScale,
        className,
      )}
      {...props}
    >
      <div
        aria-hidden={ANIMATED_GRADIENT_TEXT_TOKENS.overlay.ariaHidden}
        className={cn(ANIMATED_GRADIENT_TEXT_TOKENS.overlay.base)}
      />

      {children}
    </div>
  );
}

export { AnimatedGradientText };
