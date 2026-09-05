import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WobbleCard } from "./wobble-card";

describe("WobbleCard Component", () => {
  it("should render children inside the card", () => {
    render(
      <WobbleCard>
        <h2>Card Title</h2>
      </WobbleCard>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("should render a section with default styling classes", () => {
    const { container } = render(<WobbleCard>Content</WobbleCard>);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section?.className).toContain("rounded-2xl");
    expect(section?.className).toContain("bg-indigo-800");
  });

  it("should merge containerClassName into the section", () => {
    const { container } = render(
      <WobbleCard containerClassName="custom-container">Content</WobbleCard>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveClass("custom-container");
  });

  it("should merge className into the inner content wrapper", () => {
    const { container } = render(
      <WobbleCard className="custom-content">Content</WobbleCard>,
    );

    // The inner motion.div has px-4 py-20 classes
    const inner = container.querySelector(".px-4");
    expect(inner).toBeInTheDocument();
    expect(inner).toHaveClass("custom-content");
  });

  it("should render the noise overlay", () => {
    const { container } = render(<WobbleCard>Content</WobbleCard>);

    const noise = container.querySelector(".opacity-10");
    expect(noise).toBeInTheDocument();
  });

  it("should apply translate transform on mouse enter and reset on leave", () => {
    const { container } = render(<WobbleCard>Content</WobbleCard>);
    const section = container.querySelector("section");

    expect(section).toBeInTheDocument();
    // Default state: no translation
    expect(section?.style.transform).toContain("translate3d(0px, 0px, 0)");

    // Simulate mouse move within the card
    fireEvent.mouseEnter(section!);
    fireEvent.mouseMove(section!, { clientX: 100, clientY: 100 });

    // Transform should be updated from the mouse position
    expect(section?.style.transform).not.toContain("translate3d(0px, 0px, 0)");

    // Leave resets to identity transform
    fireEvent.mouseLeave(section!);
    expect(section?.style.transform).toContain("translate3d(0px, 0px, 0)");
  });

  it("should render role='region' and default or custom aria-label", () => {
    render(<WobbleCard>Content</WobbleCard>);
    const region = screen.getByRole("region", { name: "Wobble card section" });
    expect(region).toBeInTheDocument();

    render(<WobbleCard aria-label="Custom Section Label">Custom Content</WobbleCard>);
    const customRegion = screen.getByRole("region", { name: "Custom Section Label" });
    expect(customRegion).toBeInTheDocument();
  });
});
