import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Marquee from "./marquee";

describe("Marquee Component", () => {
  it("should render children repeated by the default repeat count", () => {
    const { container } = render(
      <Marquee>
        <span>Item</span>
      </Marquee>,
    );

    // Default repeat is 4 -> 4 repeated child groups
    const groups = container.querySelectorAll(
      "div.flex.shrink-0.justify-around",
    );
    expect(groups).toHaveLength(4);
    expect(container.querySelectorAll("span")).toHaveLength(4);
  });

  it("should render children repeated by the custom repeat count", () => {
    const { container } = render(
      <Marquee repeat={2}>
        <span>Item</span>
      </Marquee>,
    );

    expect(
      container.querySelectorAll("div.flex.shrink-0.justify-around"),
    ).toHaveLength(2);
  });

  it("should apply horizontal (flex-row) classes by default", () => {
    const { container } = render(
      <Marquee>
        <span>Item</span>
      </Marquee>,
    );

    const outer = container.firstElementChild;
    expect(outer).toHaveClass("flex-row");
    expect(outer).not.toHaveClass("flex-col");

    const group = container.querySelector("div.flex.shrink-0.justify-around");
    expect(group).toHaveClass("animate-marquee");
    expect(group).toHaveClass("flex-row");
  });

  it("should apply vertical (flex-col) classes when vertical is true", () => {
    const { container } = render(
      <Marquee vertical>
        <span>Item</span>
      </Marquee>,
    );

    const outer = container.firstElementChild;
    expect(outer).toHaveClass("flex-col");
    expect(outer).not.toHaveClass("flex-row");

    const group = container.querySelector("div.flex.shrink-0.justify-around");
    expect(group).toHaveClass("animate-marquee-vertical");
    expect(group).toHaveClass("flex-col");
  });

  it("should apply reverse animation direction when reverse is true", () => {
    const { container } = render(
      <Marquee reverse>
        <span>Item</span>
      </Marquee>,
    );

    const group = container.querySelector("div.flex.shrink-0.justify-around");
    expect(group).toHaveClass("[animation-direction:reverse]");
  });

  it("should apply pause-on-hover class when pauseOnHover is true", () => {
    const { container } = render(
      <Marquee pauseOnHover>
        <span>Item</span>
      </Marquee>,
    );

    const group = container.querySelector("div.flex.shrink-0.justify-around");
    expect(group).toHaveClass("group-hover:[animation-play-state:paused]");
  });

  it("should merge custom className with default classes", () => {
    const { container } = render(
      <Marquee className="custom-class">
        <span>Item</span>
      </Marquee>,
    );

    const outer = container.firstElementChild;
    expect(outer).toHaveClass("custom-class");
    expect(outer).toHaveClass("group");
    expect(outer).toHaveClass("overflow-hidden");
  });

  it("should forward HTML attributes to the root element", () => {
    const { container } = render(
      <Marquee data-testid="marquee-root" aria-label="Test marquee">
        <span>Item</span>
      </Marquee>,
    );

    const outer = container.firstElementChild;
    expect(outer).toHaveAttribute("data-testid", "marquee-root");
    expect(outer).toHaveAttribute("aria-label", "Test marquee");
  });

  it("should keep the first copy accessible and hide duplicate copies from assistive tech", () => {
    const { container } = render(
      <Marquee repeat={3}>
        <span>Item</span>
      </Marquee>,
    );

    const groups = container.querySelectorAll(
      "div.flex.shrink-0.justify-around",
    );
    expect(groups.length).toBe(3);
    expect(groups[0]).not.toHaveAttribute("aria-hidden");
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]).toHaveAttribute("aria-hidden", "true");
    }
  });
});
