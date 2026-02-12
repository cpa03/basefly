"use client";

import { useState } from "react";

import { FEEDBACK_TIMING, SEMANTIC_COLORS } from "@saasfly/common";
import { Check, Copy } from "@saasfly/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";
import { toast } from "@saasfly/ui/use-toast";

import { siteConfig } from "~/config/site";
import { logger } from "~/lib/logger";

export function CodeCopy() {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const command = siteConfig.cli.primary;

  const copyToClipboard = async () => {
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
  };

  return (
    <div className="flex h-12 max-w-xl items-center justify-between rounded-full bg-neutral-200 px-3 dark:bg-neutral-700/40">
      <div className="flex items-center space-x-2 font-mono text-neutral-700 dark:text-neutral-300">
        <span>$</span>
        <span>{command}</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className={`ml-2 rounded-md p-1.5 transition-all duration-150 ease-out hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                copied
                  ? `${SEMANTIC_COLORS.success.icon} bg-green-100 dark:bg-green-900/30`
                  : "text-neutral-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
              aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
              aria-busy={isCopying}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
