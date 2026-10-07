import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BLOG_CARD_TOKENS, UI_LABELS } from "@saasfly/common";
import type * as UiModule from "@saasfly/ui";

import { XBlogArticle } from "../blog-card";

// Mock next/image to render standard img tag
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

// Mock FollowerPointerCard in @saasfly/ui
vi.mock("@saasfly/ui", async () => {
  const actual = await vi.importActual<typeof UiModule>("@saasfly/ui");
  return {
    ...actual,
    FollowerPointerCard: ({
      children,
    }: {
      children: React.ReactNode;
      title?: React.ReactNode;
    }) => <div data-testid="follower-pointer-card">{children}</div>,
  };
});

describe("XBlogArticle (BlogCard)", () => {
  it("renders with default props and accessibility attributes", () => {
    render(<XBlogArticle />);

    const cardRegion = screen.getByRole(BLOG_CARD_TOKENS.defaultRole);
    expect(cardRegion).toBeInTheDocument();
    expect(cardRegion).toHaveAttribute(
      "aria-label",
      BLOG_CARD_TOKENS.defaultAriaLabel,
    );
    expect(cardRegion).toHaveAttribute("tabIndex", "0");
  });

  it("supports custom role, aria-label, and className props", () => {
    render(
      <XBlogArticle
        role="article"
        aria-label="Custom blog article label"
        className="custom-blog-card"
      />,
    );

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("aria-label", "Custom blog article label");
    expect(article).toHaveClass("custom-blog-card");
  });

  it("renders read article button with correct label and spring micro-interaction styling", () => {
    render(<XBlogArticle />);

    const button = screen.getByRole("button", {
      name: /read article/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(UI_LABELS.readMore);
    expect(button).toHaveClass("hover:scale-105");
    expect(button).toHaveClass("active:scale-95");
  });
});
