"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { SCROLL_AREA_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(SCROLL_AREA_TOKENS.root, className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={SCROLL_AREA_TOKENS.viewport}>
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", "aria-label": ariaLabel, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    aria-label={ariaLabel ?? SCROLL_AREA_TOKENS.defaultAriaLabel}
    className={cn(
      SCROLL_AREA_TOKENS.scrollbar.base,
      orientation === "vertical" && SCROLL_AREA_TOKENS.scrollbar.vertical,
      orientation === "horizontal" && SCROLL_AREA_TOKENS.scrollbar.horizontal,
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      data-testid="scroll-area-thumb"
      aria-label={ariaLabel ?? SCROLL_AREA_TOKENS.defaultAriaLabel}
      className={cn(
        SCROLL_AREA_TOKENS.thumb.base,
        SCROLL_AREA_TOKENS.thumb.hoverScale,
        SCROLL_AREA_TOKENS.thumb.activeScale,
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
