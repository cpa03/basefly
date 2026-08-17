"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { POPOVER_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn(
      POPOVER_TOKENS.trigger.base,
      POPOVER_TOKENS.trigger.hoverScale,
      POPOVER_TOKENS.trigger.activeScale,
      className,
    )}
    {...props}
  />
));
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, "aria-label": ariaLabel, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      aria-label={ariaLabel ?? POPOVER_TOKENS.defaultAriaLabel}
      className={cn(POPOVER_TOKENS.content.base, className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
