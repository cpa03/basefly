"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { SWITCH_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

const Switch = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
  >(({ className, ...props }, ref) => {
    const hasA11yLabel = props["aria-label"] ?? props["aria-labelledby"];
    const ariaLabel = hasA11yLabel
      ? props["aria-label"]
      : SWITCH_TOKENS.defaultAriaLabel;

    return (
      <SwitchPrimitives.Root
        aria-label={ariaLabel}
        className={cn(
          SWITCH_TOKENS.track.base,
          SWITCH_TOKENS.track.size,
          SWITCH_TOKENS.track.states.checked,
          SWITCH_TOKENS.track.states.unchecked,
          SWITCH_TOKENS.track.disabled,
          SWITCH_TOKENS.track.focusRing,
          SWITCH_TOKENS.track.hoverScale,
          SWITCH_TOKENS.track.activeScale,
          SWITCH_TOKENS.transition,
          className,
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            SWITCH_TOKENS.thumb.base,
            SWITCH_TOKENS.thumb.size,
            SWITCH_TOKENS.thumb.states.checked,
            SWITCH_TOKENS.thumb.states.unchecked,
            SWITCH_TOKENS.transition,
          )}
        />
      </SwitchPrimitives.Root>
    );
  }),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
