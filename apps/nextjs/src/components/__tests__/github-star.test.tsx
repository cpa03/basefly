import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GITHUB_STAR_TOKENS } from "@saasfly/common";

import { siteConfig } from "~/config/site";
import { GitHubStar } from "../github-star";

describe("GitHubStar", () => {
  it("renders GitHub link with correct href and attributes", () => {
    render(<GitHubStar />);
    const link = screen.getByRole("link", {
      name: `Star ${siteConfig.github.owner}/${siteConfig.github.repo} on GitHub`,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", siteConfig.links.github);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays the star count from siteConfig", () => {
    render(<GitHubStar />);
    expect(screen.getByText(siteConfig.github.stars)).toBeInTheDocument();
  });

  it("applies GITHUB_STAR_TOKENS base container styling and micro-interaction classes", () => {
    const { container } = render(<GitHubStar />);
    const starContainer = container.querySelector(
      `.${GITHUB_STAR_TOKENS.container.base.split(" ")[0]}`,
    );
    expect(starContainer).toBeInTheDocument();
    expect(GITHUB_STAR_TOKENS.container.base).toContain("hover:scale-[1.03]");
    expect(GITHUB_STAR_TOKENS.container.base).toContain("active:scale-[0.97]");
  });
});
