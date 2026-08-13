import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meteors } from "./meteors";

describe("Meteors Component", () => {
  it("should render the default number of meteors (20)", () => {
    const { container } = render(<Meteors />);

    const meteors = container.querySelectorAll("span[class*='animate-meteor-effect']");
    expect(meteors.length).toBe(20);
  });

  it("should render the specified number of meteors", () => {
    const { container } = render(<Meteors number={5} />);

    const meteors = container.querySelectorAll("span[class*='animate-meteor-effect']");
    expect(meteors.length).toBe(5);
  });

  it("should give each meteor a unique key", () => {
    const { container } = render(<Meteors number={3} />);

    const meteors = container.querySelectorAll("span[class*='animate-meteor-effect']");
    expect(meteors.length).toBe(3);
    // Keys are meteor0, meteor1, meteor2
    meteors.forEach((meteor) => {
      expect(meteor).toHaveClass("absolute");
    });
  });

  it("should apply inline style positions to each meteor", () => {
    const { container } = render(<Meteors number={2} />);

    const meteors = container.querySelectorAll("span[class*='animate-meteor-effect']");
    meteors.forEach((meteor) => {
      const style = (meteor as HTMLElement).style;
      expect(style.top).toBe("0px");
      expect(style.left).toMatch(/px$/);
      expect(style.animationDelay).toMatch(/s$/);
      expect(style.animationDuration).toMatch(/s$/);
    });
  });

  it("should merge a custom className into each meteor", () => {
    const { container } = render(<Meteors number={1} className="custom-meteor" />);

    const meteor = container.querySelector("span[class*='animate-meteor-effect']");
    expect(meteor).toHaveClass("custom-meteor");
  });
});