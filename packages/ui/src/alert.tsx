import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { ALERT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const alertVariants = cva(ALERT_TOKENS.container.base, {
  variants: {
    variant: ALERT_TOKENS.container.variants,
  },
  defaultVariants: {
    variant: "default",
  },
});

const Alert = React.memo(
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
  >(({ className, variant, role, "aria-label": ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role={role ?? ALERT_TOKENS.defaultRole}
      aria-label={ariaLabel ?? ALERT_TOKENS.defaultAriaLabel}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )),
);
Alert.displayName = "Alert";

const AlertTitle = React.memo(
  React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(ALERT_TOKENS.title, className)}
      {...props}
    >
      {props.children}
    </h5>
  )),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.memo(
  React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(ALERT_TOKENS.description, className)}
      {...props}
    />
  )),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
