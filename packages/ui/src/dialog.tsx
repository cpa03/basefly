"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
      className={cn(
        "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
        className,
      )}
      {...props}
    />
  )),
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(({ className, children, ...props }, ref) => {
    // Generate IDs for accessibility - find Title and Description in children
    const titleId = React.useId();
    const descriptionId = React.useId();

    let hasTitle = false;
    let hasDescription = false;

    const childrenWithIds = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Check for our specific title/description components by displayName
        const childType = child.type as React.ComponentType<{ displayName?: string }>;
        if (childType?.displayName === "DialogTitle") {
          hasTitle = true;
          return React.cloneElement(child as React.ReactElement<{ id?: string }>, {
            id: titleId,
          });
        }
        if (childType?.displayName === "DialogDescription") {
          hasDescription = true;
          return React.cloneElement(child as React.ReactElement<{ id?: string }>, {
            id: descriptionId,
          });
        }
      }
      return child;
    });

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          aria-modal="true"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          className={cn(
            "fixed bottom-0 z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in md:bottom-auto",
            "data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 md:max-w-lg md:rounded-lg md:zoom-in-90 data-[state=open]:md:slide-in-from-bottom-0",
            className,
          )}
          {...props}
        >
          {childrenWithIds}
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.memo(
  ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
  ),
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.memo(
  ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
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
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  )),
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.memo(
  React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )),
);
DialogDescription.displayName = "DialogDescription";

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
