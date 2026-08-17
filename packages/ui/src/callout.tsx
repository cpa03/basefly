import * as React from "react";

import { CALLOUT_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string;
  children?: React.ReactNode;
  type?: "default" | "warning" | "danger" | "info";
}

// ✅💡⚠️🚫🚨
export const Callout = React.memo(
  React.forwardRef<HTMLDivElement, CalloutProps>(
    ({ className, children, icon, type = "default", ...props }, ref) => {
      // Determine proper semantic role for accessibility
      const role = type === "danger" || type === "warning" ? "alert" : "status";

      return (
        <div
          ref={ref}
          role={role}
          className={cn(
            CALLOUT_TOKENS.base,
            CALLOUT_TOKENS.animations.hoverScale,
            CALLOUT_TOKENS.animations.activeScale,
            CALLOUT_TOKENS.animations.hoverShadow,
            CALLOUT_TOKENS.variants[type],
            className,
          )}
          {...props}
        >
          {icon && (
            <span className="mr-3 text-xl" aria-hidden="true">
              {icon}
            </span>
          )}
          <div>{children}</div>
        </div>
      );
    },
  ),
);

Callout.displayName = "Callout";
