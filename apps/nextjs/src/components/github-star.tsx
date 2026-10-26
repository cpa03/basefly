import Link from "next/link";

import { GITHUB_STAR_TOKENS } from "@saasfly/common";
import { GitHub } from "@saasfly/ui/icons";

import { siteConfig } from "~/config/site";

export function GitHubStar() {
  return (
    <Link
      href={siteConfig.links.github}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star ${siteConfig.github.owner}/${siteConfig.github.repo} on GitHub`}
      className="inline-block rounded-full"
    >
      <div className={GITHUB_STAR_TOKENS.container.base}>
        <GitHub className={GITHUB_STAR_TOKENS.iconSize} />
        <span>{siteConfig.github.stars}</span>
      </div>
    </Link>
  );
}
