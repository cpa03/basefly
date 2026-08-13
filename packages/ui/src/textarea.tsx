import * as React from "react";
import { TEXTAREA_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean;
  };

const Textarea = React.memo(
  React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, "aria-label": ariaLabel, ...props }, ref) => {
      const finalAriaLabel = ariaLabel ?? (props["aria-labelledby"] ? undefined : TEXTAREA_TOKENS.defaultAriaLabel);

      return (
        <textarea
          className={cn(
            TEXTAREA_TOKENS.base,
            TEXTAREA_TOKENS.minHeight,
            TEXTAREA_TOKENS.padding,
            TEXTAREA_TOKENS.transition,
            TEXTAREA_TOKENS.activeScale,
            error && `${TEXTAREA_TOKENS.error.border} ${TEXTAREA_TOKENS.error.focusRing}`,
            className,
          )}
          ref={ref}
          aria-label={finalAriaLabel}
          aria-invalid={error ?? props["aria-invalid"]}
          {...props}
        />
      );
    },
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
