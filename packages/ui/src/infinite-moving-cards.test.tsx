import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfiniteMovingCards } from "./infinite-moving-cards";

const items = [
  { quote: "First quote", name: "Alice", title: "Engineer" },
  { quote: "Second quote", name: "Bob", title: "Designer" },
];

describe("InfiniteMovingCards Component", () => {
  it("should render all provided items", () => {
    render(<InfiniteMovingCards items={items} />);

    // Items are duplicated once for the infinite scroll effect
    expect(screen.getAllByText("First quote").length).toBe(2);
    expect(screen.getAllByText("Second quote").length).toBe(2);
    expect(screen.getAllByText("Alice").length).toBe(2);
    expect(screen.getAllByText("Bob").length).toBe(2);
    expect(screen.getAllByText("Engineer").length).toBe(2);
    expect(screen.getAllByText("Designer").length).toBe(2);
  });

  it("should duplicate items for the infinite scroll effect", () => {
    const { container } = render(<InfiniteMovingCards items={items} />);

    // Each item is cloned once -> 4 list items total
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(4);
  });

  it("should set animation direction to forwards for left direction", () => {
    const { container } = render(<InfiniteMovingCards items={items} direction="left" />);

    const scroller = container.querySelector(".scroller");
    expect(scroller).toBeInTheDocument();
    expect(scroller?.getAttribute("style")).toContain("--animation-direction: forwards");
  });

  it("should set animation direction to reverse for right direction", () => {
    const { container } = render(<InfiniteMovingCards items={items} direction="right" />);

    const scroller = container.querySelector(".scroller");
    expect(scroller?.getAttribute("style")).toContain("--animation-direction: reverse");
  });

  it("should set the animation duration based on speed", () => {
    const { container } = render(<InfiniteMovingCards items={items} speed="slow" />);

    const scroller = container.querySelector(".scroller");
    expect(scroller?.getAttribute("style")).toContain("--animation-duration: 80s");
  });

  it("should apply the animate-scroll class once started", () => {
    const { container } = render(<InfiniteMovingCards items={items} />);

    const ul = container.querySelector("ul");
    expect(ul?.className).toContain("animate-scroll");
  });

  it("should merge custom className into the scroller container", () => {
    const { container } = render(<InfiniteMovingCards items={items} className="custom-scroller" />);

    const scroller = container.querySelector(".scroller");
    expect(scroller).toHaveClass("custom-scroller");
  });
});