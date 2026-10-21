import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SHIMMER_BUTTON_TOKENS } from "@saasfly/common";

import ShimmerButton from "../shimmer-button";

describe("ShimmerButton", () => {
  it("renders children content correctly", () => {
    render(<ShimmerButton>Click me</ShimmerButton>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("includes SHIMMER_BUTTON_TOKENS base classes and focus-visible ring styles", () => {
    render(<ShimmerButton>Shimmer</ShimmerButton>);
    const button = screen.getByRole("button", { name: "Shimmer" });
    expect(button.className).toContain(SHIMMER_BUTTON_TOKENS.focusRing);
    expect(button.className).toContain("active:scale-[0.98]");
    expect(SHIMMER_BUTTON_TOKENS.defaultRadius).toBe("100px");
  });

  it("uses text children for accessible aria-label when string", () => {
    render(<ShimmerButton>Get Started</ShimmerButton>);
    const button = screen.getByRole("button", { name: "Get Started" });
    expect(button).toBeInTheDocument();
  });

  it("supports explicit aria-label prop override", () => {
    render(
      <ShimmerButton aria-label="Custom Action">
        <span>Icon Text</span>
      </ShimmerButton>,
    );
    const button = screen.getByRole("button", { name: "Custom Action" });
    expect(button).toBeInTheDocument();
  });

  it("applies custom className and style custom properties", () => {
    render(
      <ShimmerButton className="custom-btn" borderRadius="50px">
        Test
      </ShimmerButton>,
    );
    const button = screen.getByRole("button", { name: "Test" });
    expect(button.className).toContain("custom-btn");
  });
});
