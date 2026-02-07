"use client"

import { useState } from "react"
import { Check, Copy } from "@saasfly/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@saasfly/ui/tooltip";
import { logger } from "~/lib/logger";
import { siteConfig } from "~/config/site";
import { FEEDBACK_TIMING, SEMANTIC_COLORS } from "@saasfly/common";

export function CodeCopy() {
  const [copied, setCopied] = useState(false)
  const command = siteConfig.cli.installCommand

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), FEEDBACK_TIMING.copySuccess)
    } catch (err) {
      logger.error("Failed to copy text", err, { command });
    }
  }

  return (
    <div className="rounded-full h-12 px-3 flex items-center justify-between max-w-xl bg-neutral-200 dark:bg-neutral-700/40">
      <div className="flex items-center space-x-2 font-mono text-neutral-700 dark:text-neutral-300">
        <span>$</span>
        <span>{command}</span>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className={`p-1.5 rounded-md transition-all duration-150 ease-out ml-2 hover:scale-110 ${
                copied 
                  ? `${SEMANTIC_COLORS.success.icon} bg-green-100 dark:bg-green-900/30` 
                  : "hover:bg-gray-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
              aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}