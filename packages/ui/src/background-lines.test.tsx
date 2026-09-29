import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BackgroundLines } from "./background-lines";

describe("BackgroundLines Component", () => {
  it("should render children inside the container", () => {
    render(
      <BackgroundLines>
        <h1>Hero Title</h1>
      </BackgroundLines>,
    );

    expect(screen.getByText("Hero Title")).toBeInTheDocument();
  });

  it("should render the container with default sizing classes", () => {
    const { container } = render(
      <BackgroundLines>
        <span>Content</span>
      </BackgroundLines>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.className).toContain("w-full");
    expect(wrapper?.className).toContain("bg-background");
  });

  it("should merge custom className into the container", () => {
    const { container } = render(
      <BackgroundLines className="custom-bg">
        <span>Content</span>
      </BackgroundLines>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("custom-bg");
  });

  it("should render an SVG with animated paths", () => {
    const { container } = render(
      <BackgroundLines>
        <span>Content</span>
      </BackgroundLines>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 1440 900");

    // paths array has 21 entries, rendered twice (first + second)
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(42);
  });

  it("should render children after the SVG", () => {
    const { container } = render(
      <BackgroundLines>
        <span data-testid="child">Content</span>
      </BackgroundLines>,
    );

    const svg = container.querySelector("svg");
    const child = container.querySelector('[data-testid="child"]');
    expect(svg).toBeInTheDocument();
    expect(child).toBeInTheDocument();
  });

  it("should mark the decorative SVG as aria-hidden and non-focusable", () => {
    const { container } = render(
      <BackgroundLines>
        <span>Content</span>
      </BackgroundLines>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("should render default role, aria-label, and focus/hover micro-interaction tokens", () => {
    render(
      <BackgroundLines>
        <span>Content</span>
      </BackgroundLines>,
    );

    const region = screen.getByRole("region", {
      name: "Animated background lines",
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("tabIndex", "0");
    expect(region.className).toContain("hover:scale-[1.002]");
    expect(region.className).toContain("active:scale-[0.998]");
    expect(region.className).toContain("focus-visible:ring-2");
  });

  it("should support custom role and aria-label", () => {
    render(
      <BackgroundLines role="banner" aria-label="Hero background">
        <span>Content</span>
      </BackgroundLines>,
    );

    const banner = screen.getByRole("banner", { name: "Hero background" });
    expect(banner).toBeInTheDocument();
  });
});
