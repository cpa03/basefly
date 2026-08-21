import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { ALERT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const alertVariants = cva(
  cn(ALERT_TOKENS.base, ALERT_TOKENS.animations.hoverShadow),
  {
    variants: {
      variant: {
        default: ALERT_TOKENS.variants.default,
        destructive: ALERT_TOKENS.variants.destructive,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.memo(
  React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
  >(({ className, variant, role = ALERT_TOKENS.defaultAriaRole, ...props }, ref) => (
    <div
      ref={ref}
      role={role}
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
