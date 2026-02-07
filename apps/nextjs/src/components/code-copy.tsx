"use client"

import { useState } from "react"
import { Check, Copy } from "@saasfly/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@saasfly/ui/tooltip";
import { logger } from "~/lib/logger";

export function CodeCopy() {
  const [copied, setCopied] = useState(false)
  const command = "bun create saasfly"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-md transition-colors ml-2"
              aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
            >
              {copied ? <Check className="w-4 h-4 text-neutral-700 dark:text-neutral-300" /> : <Copy className={`w-4 h-4 text-neutral-700 dark:text-neutral-300`} />}
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