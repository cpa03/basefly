import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnimatedList } from "./animated-list";

describe("AnimatedList Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render the first child initially", () => {
    render(
      <AnimatedList>
        <div>Item One</div>
        <div>Item Two</div>
      </AnimatedList>,
    );

    expect(screen.getByText("Item One")).toBeInTheDocument();
    expect(screen.queryByText("Item Two")).not.toBeInTheDocument();
  });

  it("should render a flex column container", () => {
    const { container } = render(
      <AnimatedList>
        <div>Item</div>
      </AnimatedList>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.className).toContain("flex");
    expect(wrapper?.className).toContain("flex-col");
  });

  it("should merge custom className into the container", () => {
    const { container } = render(
      <AnimatedList className="custom-list">
        <div>Item</div>
      </AnimatedList>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("custom-list");
  });

  it("should reveal items progressively over time", () => {
    render(
      <AnimatedList delay={100}>
        <div>Item One</div>
        <div>Item Two</div>
        <div>Item Three</div>
      </AnimatedList>,
    );

    expect(screen.getByText("Item One")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Item Two")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText("Item Three")).toBeInTheDocument();
  });

  it("should wrap items in motion list items", () => {
    const { container } = render(
      <AnimatedList>
        <div>Item</div>
      </AnimatedList>,
    );

    // AnimatedListItem renders motion.div with mx-auto w-full classes
    const itemWrapper = container.querySelector(".mx-auto");
    expect(itemWrapper).toBeInTheDocument();
  });
});