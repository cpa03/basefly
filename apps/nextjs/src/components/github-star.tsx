"use client";

import Link from "next/link";

import { TRANSITION_PRESETS } from "@saasfly/common/config/ui";
import { GitHub } from "@saasfly/ui/icons";

import { siteConfig } from "~/config/site";

export function GitHubStar() {
  return (
    <Link
      href={siteConfig.links.github}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star ${siteConfig.github.owner}/${siteConfig.github.repo} on GitHub`}
    >
      <div
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-input px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${TRANSITION_PRESETS.container}`}
      >
        <GitHub className="h-4 w-4" />
        <span>{siteConfig.github.stars}</span>
      </div>
    </Link>
  );
}
