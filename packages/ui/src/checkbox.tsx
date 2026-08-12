"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CHECKBOX_TOKENS } from "@saasfly/common";
import { Check } from "lucide-react";

import { cn } from "./utils/cn";

const Checkbox = React.memo(
  React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  >(({ className, "aria-label": ariaLabel, ...props }, ref) => {
    const finalAriaLabel = ariaLabel ?? (props["aria-labelledby"] ? undefined : CHECKBOX_TOKENS.defaultAriaLabel);

    return (
      <CheckboxPrimitive.Root
        ref={ref}
        aria-label={finalAriaLabel}
        className={cn(
          CHECKBOX_TOKENS.root.base,
          CHECKBOX_TOKENS.root.states.checked,
          CHECKBOX_TOKENS.root.states.unchecked,
          CHECKBOX_TOKENS.root.hoverScale,
          CHECKBOX_TOKENS.root.activeScale,
          CHECKBOX_TOKENS.transition,
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            CHECKBOX_TOKENS.indicator.base,
            CHECKBOX_TOKENS.indicator.states.checked,
            CHECKBOX_TOKENS.indicator.states.unchecked,
          )}
        >
          <Check className={CHECKBOX_TOKENS.iconSize} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
