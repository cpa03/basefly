"use client";

import * as React from "react";
import { X } from "lucide-react";

import { INPUT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  clearable?: boolean;
};

const Input = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(
    (
      {
        className,
        type,
        error,
        clearable = false,
        onChange,
        value,
        disabled,
        readOnly,
        ...props
      },
      ref,
    ) => {
      const inputRef = React.useRef<HTMLInputElement>(null);
      const [hasContent, setHasContent] = React.useState(false);

      React.useImperativeHandle(
        ref,
        () => inputRef.current ?? ({} as HTMLInputElement),
      );

      const checkContent = React.useCallback(() => {
        const inputValue = inputRef.current?.value ?? "";
        setHasContent(inputValue.length > 0);
      }, []);

      const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          checkContent();
          onChange?.(e);
        },
        [onChange, checkContent],
      );

      const handleClear = React.useCallback(() => {
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.focus();
          setHasContent(false);
          const event = new Event("input", { bubbles: true });
          inputRef.current.dispatchEvent(event);
          onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }, [onChange]);

      React.useEffect(() => {
        checkContent();
      }, [value, checkContent]);

      const shouldShowClearButton =
        clearable && hasContent && !disabled && !readOnly;

      return (
        <div className="relative flex w-full items-center">
          <input
            type={type}
            className={cn(
              "flex w-full rounded-md bg-transparent ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              INPUT_TOKENS.heights.default,
              INPUT_TOKENS.border.default,
              INPUT_TOKENS.padding,
              INPUT_TOKENS.appearance.text,
              INPUT_TOKENS.appearance.placeholder,
              INPUT_TOKENS.focusRing.default,
              INPUT_TOKENS.disabled,
              error && "border-destructive focus-visible:ring-destructive",
              shouldShowClearButton && "pr-9",
              className,
            )}
            ref={inputRef}
            aria-invalid={error ?? props["aria-invalid"]}
            onChange={handleChange}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />
          {shouldShowClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute right-2 flex h-5 w-5 items-center justify-center rounded-full",
                "bg-muted text-muted-foreground",
                "opacity-0 transition-all duration-200 ease-out",
                "hover:bg-muted-foreground/20 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "hover:scale-110 active:scale-95",
                hasContent && "opacity-100",
              )}
              aria-label="Clear input"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      );
    },
  ),
);
Input.displayName = "Input";

export { Input };
