import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardSkeleton } from "../card-skeleton";

describe("CardSkeleton", () => {
  it("renders the skeleton structure", () => {
    const { container } = render(<CardSkeleton />);

    // Should render a card container
    const card = container.querySelector("[class*='rounded-lg border']");
    expect(card).toBeInTheDocument();

    // Should render skeleton placeholders
    const skeletons = container.querySelectorAll("[aria-busy='true']");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders skeletons with different sizes", () => {
    const { container } = render(<CardSkeleton />);

    const skeletons = container.querySelectorAll("[aria-busy='true']");

    // Should have skeletons of varying widths
    const widths = Array.from(skeletons).map(
      (s) => (s as HTMLElement).className,
    );

    // At least one skeleton with 1/5 width (title)
    const hasTitleWidth = widths.some((c) => c.includes("w-1/5"));
    // At least one skeleton with 4/5 width (description)
    const hasDescriptionWidth = widths.some((c) => c.includes("w-4/5"));
    // At least one skeleton with fixed width (action)
    const hasActionWidth = widths.some((c) => c.includes("w-[120px]"));

    expect(hasTitleWidth).toBe(true);
    expect(hasDescriptionWidth).toBe(true);
    expect(hasActionWidth).toBe(true);
  });

  it("renders within a Card component", () => {
    const { container } = render(<CardSkeleton />);

    // Card has rounded-lg class
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain("rounded-lg");
  });
});
