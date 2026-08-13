import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardSkeleton } from "./card-skeleton";

describe("CardSkeleton Component", () => {
  it("should render a card with header, content, and footer sections", () => {
    const { container } = render(<CardSkeleton />);

    // Card root element
    const card = container.querySelector("div.rounded-lg.border");
    expect(card).toBeInTheDocument();

    // Three skeleton placeholders: header title, header subtitle, footer
    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    expect(skeletons.length).toBe(3);
  });

  it("should render two skeleton placeholders in the header", () => {
    const { container } = render(<CardSkeleton />);

    // Header title skeleton (w-1/5) and subtitle skeleton (w-4/5)
    expect(container.querySelector(".w-1\\/5")).toBeInTheDocument();
    expect(container.querySelector(".w-4\\/5")).toBeInTheDocument();
  });

  it("should render a content area with fixed height", () => {
    const { container } = render(<CardSkeleton />);

    expect(container.querySelector("div.h-10")).toBeInTheDocument();
  });

  it("should render a footer skeleton with fixed width", () => {
    const { container } = render(<CardSkeleton />);

    const footerSkeleton = container.querySelector(".w-\\[120px\\]");
    expect(footerSkeleton).toBeInTheDocument();
    expect(footerSkeleton).toHaveClass("h-8");
  });

  it("should mark skeleton placeholders as busy for screen readers", () => {
    const { container } = render(<CardSkeleton />);

    const skeletons = container.querySelectorAll('[aria-busy="true"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute("aria-label", "Loading...");
    });
  });

  it("should not render any interactive content", () => {
    render(<CardSkeleton />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});