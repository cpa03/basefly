import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MARKETING_FALLBACKS } from "@saasfly/common";

import { WordReveal } from "../word-reveal";

describe("WordReveal component", () => {
  it("renders with proper accessibility attributes and container styling", () => {
    render(<WordReveal />);

    const container = screen.getByRole("region", {
      name: "Text reveal presentation",
    });
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("transition-transform");
  });

  it("renders the words from centralized MARKETING_FALLBACKS config", () => {
    render(<WordReveal />);

    const words = MARKETING_FALLBACKS.wordReveal.split(" ");
    for (const word of words) {
      expect(screen.getAllByText(word).length).toBeGreaterThan(0);
    }
  });
});
