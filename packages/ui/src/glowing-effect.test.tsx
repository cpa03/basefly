import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlowingEffect } from "./glowing-effect";

describe("GlowingEffect Component", () => {
  it("should render the glow border div", () => {
    const { container } = render(<GlowingEffect />);

    const borderDiv = container.querySelector("div");
    expect(borderDiv).toBeInTheDocument();
    expect(borderDiv?.className).toContain("border");
  });

  it("should render the gradient container with CSS custom properties", () => {
    const { container } = render(<GlowingEffect />);

    const gradientDiv = container.querySelector("div[style]");
    expect(gradientDiv).toBeInTheDocument();
    expect(gradientDiv?.getAttribute("style")).toContain("--blur");
    expect(gradientDiv?.getAttribute("style")).toContain("--spread");
    expect(gradientDiv?.getAttribute("style")).toContain("--start");
    expect(gradientDiv?.getAttribute("style")).toContain("--active");
  });

  it("should be hidden by default when disabled", () => {
    const { container } = render(<GlowingEffect disabled />);

    const gradientDiv = container.querySelector("div[style]");
    expect(gradientDiv?.className).toContain("hidden");
  });

  it("should be visible when disabled is false", () => {
    const { container } = render(<GlowingEffect disabled={false} />);

    const gradientDiv = container.querySelector("div[style]");
    expect(gradientDiv?.className).not.toContain("hidden");
  });

  it("should apply white variant class", () => {
    const { container } = render(<GlowingEffect variant="white" />);

    const borderDiv = container.querySelector("div");
    expect(borderDiv?.className).toContain("border-white");
  });

  it("should merge custom className into the gradient container", () => {
    const { container } = render(<GlowingEffect className="custom-glow" />);

    const gradientDiv = container.querySelector("div[style]");
    expect(gradientDiv).toHaveClass("custom-glow");
  });

  it("should apply blur class when blur is greater than zero", () => {
    const { container } = render(<GlowingEffect blur={10} />);

    const gradientDiv = container.querySelector("div[style]");
    expect(gradientDiv?.className).toContain("blur");
  });

  it("should render the inner glow overlay", () => {
    const { container } = render(<GlowingEffect />);

    const glowOverlay = container.querySelector(".glow");
    expect(glowOverlay).toBeInTheDocument();
  });
});
