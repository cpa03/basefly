"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { LABEL_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const labelVariants = cva(LABEL_TOKENS.base);

const Label = React.memo(
  React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
      VariantProps<typeof labelVariants>
  >(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    />
  )),
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
