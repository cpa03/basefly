"use client";

import Link from "next/link";
import { GitHub } from "@saasfly/ui/icons";
import { TRANSITION_PRESETS } from "@saasfly/common/config/ui";
import { siteConfig } from "~/config/site";

export function GitHubStar() {
  return (
    <Link 
      href={siteConfig.links.github} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={`Star ${siteConfig.github.owner}/${siteConfig.github.repo} on GitHub`}
    >
      <div className={`inline-flex items-center gap-1.5 px-3 h-9 border border-input hover:bg-accent hover:text-accent-foreground rounded-full text-sm font-medium transition-colors ${TRANSITION_PRESETS.container}`}>
        <GitHub className="w-4 h-4"/>
        <span>{siteConfig.github.stars}</span>
      </div>
    </Link>
  )
}