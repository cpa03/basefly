"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { AVATAR_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const Avatar = React.memo(
  React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
  >(({ className, "aria-label": ariaLabel, ...props }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      aria-label={ariaLabel ?? AVATAR_TOKENS.defaultAriaLabel}
      className={cn(
        AVATAR_TOKENS.root.base,
        AVATAR_TOKENS.root.hoverScale,
        AVATAR_TOKENS.root.activeScale,
        className,
      )}
      {...props}
    />
  )),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.memo(
  React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
  >(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn(AVATAR_TOKENS.image.base, className)}
      {...props}
    />
  )),
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.memo(
  React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
  >(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(AVATAR_TOKENS.fallback.base, className)}
      {...props}
    />
  )),
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
