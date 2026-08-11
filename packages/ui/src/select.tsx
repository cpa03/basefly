"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { SELECT_TOKENS } from "@saasfly/common";
import { cn } from "./utils/cn";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
  >(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        SELECT_TOKENS.trigger.base,
        SELECT_TOKENS.trigger.size,
        SELECT_TOKENS.trigger.focusRing,
        SELECT_TOKENS.trigger.transition,
        SELECT_TOKENS.trigger.hoverScale,
        SELECT_TOKENS.trigger.activeScale,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn(
            SELECT_TOKENS.chevron.size,
            SELECT_TOKENS.chevron.opacity,
            SELECT_TOKENS.chevron.transition,
            SELECT_TOKENS.chevron.openRotation,
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )),
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
  >(({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          SELECT_TOKENS.content.base,
          position === "popper" && SELECT_TOKENS.content.popperTranslate,
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            SELECT_TOKENS.viewport.base,
            position === "popper" && SELECT_TOKENS.viewport.popperSize,
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )),
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
  >(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(SELECT_TOKENS.label.base, className)}
      {...props}
    />
  )),
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
  >(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(SELECT_TOKENS.item.base, className)}
      {...props}
    >
      <span className={cn(SELECT_TOKENS.item.indicatorWrapper)}>
        <SelectPrimitive.ItemIndicator>
          <Check className={cn(SELECT_TOKENS.item.indicatorSize)} />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )),
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.memo(
  React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
  >(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn(SELECT_TOKENS.separator.base, className)}
      {...props}
    />
  )),
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
