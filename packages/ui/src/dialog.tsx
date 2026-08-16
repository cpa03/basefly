"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DIALOG_TOKENS } from "@saasfly/common";
import { X } from "lucide-react";

import { cn } from "./utils/cn";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = React.memo(
  ({ children, ...props }: DialogPrimitive.DialogPortalProps) => (
    <DialogPrimitive.Portal {...props}>
      <div className="fixed inset-0 z-50 flex items-start justify-center md:items-center">
        {children}
      </div>
    </DialogPrimitive.Portal>
  ),
);
DialogPortal.displayName = "DialogPortal";

const DialogOverlay = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(DIALOG_TOKENS.overlay.base, className)}
      {...props}
    />
  )),
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-modal="true"
        className={cn(DIALOG_TOKENS.content.base, className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={DIALOG_TOKENS.defaultAriaLabel}
          className={cn(
            DIALOG_TOKENS.closeButton.base,
            DIALOG_TOKENS.closeButton.hoverScale,
            DIALOG_TOKENS.closeButton.activeScale,
          )}
        >
          <X className={DIALOG_TOKENS.closeButton.size} />
          <span className="sr-only">{DIALOG_TOKENS.defaultAriaLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.memo(
  ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn(DIALOG_TOKENS.header.base, className)} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.memo(
  ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn(DIALOG_TOKENS.footer.base, className)} {...props} />
  ),
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(DIALOG_TOKENS.title.base, className)}
      {...props}
    />
  )),
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(DIALOG_TOKENS.description.base, className)}
      {...props}
    />
  )),
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogClose = DialogPrimitive.Close;

export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
