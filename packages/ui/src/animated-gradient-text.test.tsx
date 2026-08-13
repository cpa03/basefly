import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedGradientText } from "./animated-gradient-text";

describe("AnimatedGradientText Component", () => {
  it("should render children inside the component", () => {
    const { getByText } = render(
      <AnimatedGradientText>Hello World</AnimatedGradientText>,
    );

    expect(getByText("Hello World")).toBeInTheDocument();
  });

  it("should render a gradient overlay layer", () => {
    const { container } = render(
      <AnimatedGradientText>Content</AnimatedGradientText>,
    );

    const gradientLayer = container.querySelector(".bg-gradient-to-r");
    expect(gradientLayer).toBeInTheDocument();
    expect(gradientLayer).toHaveClass("animate-gradient");
  });

  it("should apply the default layout classes to the root element", () => {
    const { container } = render(
      <AnimatedGradientText>Content</AnimatedGradientText>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("group");
    expect(root).toHaveClass("relative");
    expect(root).toHaveClass("flex");
    expect(root).toHaveClass("items-center");
  });

  it("should merge a custom className with the default classes", () => {
    const { container } = render(
      <AnimatedGradientText className="custom-class">
        Content
      </AnimatedGradientText>,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-class");
    expect(root).toHaveClass("group");
  });

  it("should render complex React nodes as children", () => {
    const { getByRole } = render(
      <AnimatedGradientText>
        <span role="img" aria-label="star">
          ⭐
        </span>
        <strong>Featured</strong>
      </AnimatedGradientText>,
    );

    expect(getByRole("img", { name: "star" })).toBeInTheDocument();
    expect(getByRole("strong")).toBeInTheDocument();
  });
});