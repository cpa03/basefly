"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { TABS_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const Tabs = TabsPrimitive.Root;

const TabsList = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(TABS_TOKENS.list.base, className)}
      {...props}
    />
  )),
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        TABS_TOKENS.trigger.base,
        TABS_TOKENS.trigger.hoverScale,
        TABS_TOKENS.trigger.activeScale,
        className,
      )}
      {...props}
    />
  )),
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
  >(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(TABS_TOKENS.content.base, className)}
      {...props}
    />
  )),
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
