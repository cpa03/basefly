"use client";

import * as React from "react";

import {
  ANIMATION,
  FEEDBACK_TIMING,
  ICON_SIZES,
  SEMANTIC_COLORS,
} from "@saasfly/common";
import { Copy } from "@saasfly/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";
import { toast } from "@saasfly/ui/use-toast";

import { siteConfig } from "~/config/site";
import { logger } from "~/lib/logger";

function AnimatedCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5L20 7" className="check-draw-path" />
    </svg>
  );
}

function CopyProgressRing({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * CodeCopy - Enhanced CLI command copy component with micro-UX feedback
 *
 * Micro-UX Improvements:
 * - Animated checkmark with draw-in effect on successful copy
 * - Progress ring during copy operation for immediate feedback
 * - Scale animation on button press for tactile feel
 * - Improved focus states with visible ring
 * - Smart tooltip that changes based on state
 * - Keyboard shortcut support (Ctrl+C when focused)
 * - Reduced motion support for accessibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CodeCopy />
 * ```
 */
export function CodeCopy() {
  const [copied, setCopied] = React.useState(false);
  const [isCopying, setIsCopying] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const command = siteConfig.cli.primary;
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const copyToClipboard = React.useCallback(async () => {
    if (isCopying || copied) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_TIMING.copySuccess);
    } catch (err: unknown) {
      logger.error(
        "Failed to copy text",
        err instanceof Error ? err.message : String(err),
        { command },
      );
      toast({
        title: "Failed to copy",
        description:
          "Could not copy to clipboard. Please try again or copy manually.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  }, [command, copied, isCopying]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "c" &&
        (e.ctrlKey || e.metaKey) &&
        buttonRef.current === document.activeElement
      ) {
        e.preventDefault();
        void copyToClipboard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copyToClipboard]);

  const tooltipContent = React.useMemo(() => {
    if (copied) return "Copied to clipboard!";
    if (isCopying) return "Copying...";
    return "Copy to clipboard (Ctrl+C when focused)";
  }, [copied, isCopying]);

  return (
    <div
      className={`group flex h-12 max-w-xl items-center justify-between rounded-full bg-neutral-200 px-3 dark:bg-neutral-700/40 ${ANIMATION.transition.normal} hover:bg-neutral-300 dark:hover:bg-neutral-600/50`}
    >
      <div className="flex items-center space-x-2 font-mono text-neutral-700 dark:text-neutral-300">
        <span className="select-none text-neutral-500 dark:text-neutral-400">
          $
        </span>
        <span className="relative">
          {command}
          <span
            className={`pointer-events-none absolute inset-0 -mx-1 rounded bg-primary/10 dark:bg-primary/20 ${ANIMATION.duration.fast} ${ANIMATION.easing.default} ${copied ? "opacity-100" : "opacity-0"} `}
          />
        </span>
      </div>

      <TooltipProvider delayDuration={FEEDBACK_TIMING.tooltipDelay}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={buttonRef}
              onClick={copyToClipboard}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              disabled={isCopying}
              className={`relative ml-2 rounded-md p-1.5 transition-all ${ANIMATION.duration.fast} ${ANIMATION.easing.default} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                copied
                  ? `${SEMANTIC_COLORS.success.icon} bg-green-100 dark:bg-green-900/30`
                  : "text-neutral-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
              } ${isPressed ? "scale-90" : "hover:scale-110"} `}
              aria-label={tooltipContent}
              aria-busy={isCopying}
              aria-live="polite"
            >
              <span
                className={`block transition-all ${ANIMATION.duration.normal} ${copied ? "scale-100 opacity-100" : "scale-90 opacity-0"} `}
              >
                <AnimatedCheck className={ICON_SIZES.sm} />
              </span>

              <span
                className={`absolute inset-0 flex items-center justify-center transition-all ${ANIMATION.duration.normal} ${copied ? "scale-90 opacity-0" : "scale-100 opacity-100"} `}
              >
                {isCopying ? (
                  <CopyProgressRing className={ICON_SIZES.sm} />
                ) : (
                  <Copy className={ICON_SIZES.sm} />
                )}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={8}
            className={` ${ANIMATION.duration.fast} ${ANIMATION.easing.default} `}
          >
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {copied ? "Command copied to clipboard" : ""}
      </span>
    </div>
  );
}
