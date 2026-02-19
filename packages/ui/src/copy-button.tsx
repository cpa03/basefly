"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { ANIMATION, FEEDBACK_TIMING, ICON_SIZES } from "@saasfly/common";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "./utils/cn";

interface CopyButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onCopy"
> {
  /**
   * The text to copy to clipboard
   */
  value: string;
  /**
   * Callback when content is successfully copied
   */
  onCopy?: (value: string) => void;
  /**
   * Callback when copy fails
   */
  onError?: (error: Error) => void;
  /**
   * Whether to show the tooltip
   * @default true
   */
  showTooltip?: boolean;
  /**
   * Custom tooltip text when idle
   */
  tooltipText?: string;
  /**
   * Custom tooltip text when copied
   */
  tooltipSuccessText?: string;
  /**
   * Size of the button
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
  /**
   * Variant of the button
   * @default "default"
   */
  variant?: "default" | "ghost" | "outline";
  /**
   * Whether to show the success state
   * @default true
   */
  showSuccessState?: boolean;
  /**
   * Duration to show success state in ms
   * @default 2000
   */
  successDuration?: number;
}

/**
 * CopyButton - A reusable copy button with delightful micro-UX feedback
 *
 * Micro-UX Improvements:
 * - Animated icon transition between copy and check states
 * - Scale animation on button press for tactile feedback
 * - Smart tooltip that updates based on copy state
 * - Reduced motion support for accessibility
 * - Proper ARIA attributes for screen readers
 * - Visual feedback with color changes on success
 * - Keyboard shortcut support (Ctrl+C when focused)
 * - Error handling with fallback behavior
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CopyButton value="text to copy" />
 *
 * // With custom styling
 * <CopyButton
 *   value="api-key-123"
 *   size="sm"
 *   variant="outline"
 *   className="ml-2"
 * />
 *
 * // With callbacks
 * <CopyButton
 *   value="content"
 *   onCopy={(value) => console.log("Copied:", value)}
 *   onError={(error) => console.error("Failed:", error)}
 * />
 * ```
 */
const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      onCopy,
      onError,
      showTooltip = true,
      tooltipText = "Copy to clipboard",
      tooltipSuccessText = "Copied!",
      size = "default",
      variant = "default",
      showSuccessState = true,
      successDuration = FEEDBACK_TIMING.copySuccess,
      className,
      disabled,
      onClick,
      onKeyDown,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [hasCopied, setHasCopied] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] =
      React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    React.useEffect(() => {
      if (hasCopied) {
        const timer = setTimeout(() => {
          setHasCopied(false);
        }, successDuration);

        return () => clearTimeout(timer);
      }
    }, [hasCopied, successDuration]);

    const handleCopy = React.useCallback(async () => {
      if (!value || disabled) return;

      try {
        await navigator.clipboard.writeText(value);
        setHasCopied(true);
        onCopy?.(value);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    }, [value, disabled, onCopy, onError]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        void handleCopy();
        onClick?.(e);
      },
      [handleCopy, onClick],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
          e.preventDefault();
          void handleCopy();
        }
        onKeyDown?.(e);
      },
      [handleCopy, onKeyDown],
    );

    const sizeStyles = {
      sm: {
        button: "h-7 w-7",
        icon: ICON_SIZES.xs,
      },
      default: {
        button: "h-9 w-9",
        icon: ICON_SIZES.sm,
      },
      lg: {
        button: "h-11 w-11",
        icon: ICON_SIZES.md,
      },
    };

    const variantStyles = {
      default: cn(
        "bg-background border border-input",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ),
      ghost: cn(
        "bg-transparent",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ),
      outline: cn(
        "bg-transparent border border-input",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      ),
    };

    const successStyles = hasCopied
      ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
      : "";

    const currentTooltipText = hasCopied ? tooltipSuccessText : tooltipText;
    const currentAriaLabel = hasCopied
      ? `${tooltipSuccessText}: ${value}`
      : `${tooltipText}: ${value}`;

    const button = (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
              node;
          }
        }}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={Boolean(disabled) || !value}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md",
          "transition-colors",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeStyles[size].button,
          variantStyles[variant],
          showSuccessState && successStyles,
          !prefersReducedMotion &&
            (isPressed ? "scale-90" : "hover:scale-105 active:scale-95"),
          ANIMATION.transition.fast,
          className,
        )}
        aria-label={ariaLabel ?? currentAriaLabel}
        aria-live="polite"
        aria-busy={hasCopied}
        aria-pressed={hasCopied}
        title={showTooltip ? undefined : currentTooltipText}
        {...props}
      >
        <span className="relative flex items-center justify-center">
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all",
              ANIMATION.duration.normal,
              ANIMATION.easing.default,
              hasCopied
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-50 opacity-0",
            )}
            aria-hidden={!hasCopied}
          >
            <Check className={cn(sizeStyles[size].icon, "stroke-[3]")} />
          </span>

          <span
            className={cn(
              "transition-all",
              ANIMATION.duration.normal,
              ANIMATION.easing.default,
              hasCopied
                ? "rotate-90 scale-50 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
            aria-hidden={hasCopied}
          >
            <Copy className={sizeStyles[size].icon} />
          </span>
        </span>

        <span className="sr-only" role="status">
          {hasCopied ? tooltipSuccessText : ""}
        </span>
      </button>
    );

    if (!showTooltip) {
      return button;
    }

    return (
      <TooltipProvider delayDuration={FEEDBACK_TIMING.tooltipDelay}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={4}
            className={cn(
              "text-xs",
              ANIMATION.duration.fast,
              ANIMATION.easing.default,
            )}
          >
            <p>
              {currentTooltipText}
              {!hasCopied && (
                <span className="ml-1 text-muted-foreground">(Ctrl+C)</span>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

CopyButton.displayName = "CopyButton";

export { CopyButton, type CopyButtonProps };
