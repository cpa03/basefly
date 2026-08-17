import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CHECKBOX_TOKENS } from "@saasfly/common";

import { Checkbox } from "./checkbox";

describe("Checkbox Component", () => {
  it("should render successfully", () => {
    const { container } = render(<Checkbox />);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("should fallback to default aria-label if none is provided", () => {
    const { container } = render(<Checkbox />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute(
      "aria-label",
      CHECKBOX_TOKENS.defaultAriaLabel,
    );
  });

  it("should use explicitly provided aria-label", () => {
    const { container } = render(<Checkbox aria-label="Custom Check" />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("aria-label", "Custom Check");
  });

  it("should not override aria-label if aria-labelledby is provided", () => {
    const { container } = render(<Checkbox aria-labelledby="label-id" />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("aria-labelledby", "label-id");
  });

  it("should apply custom classNames", () => {
    const { container } = render(<Checkbox className="custom-test-class" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-test-class");
  });

  it("should apply Checkbox design tokens for root", () => {
    const { container } = render(<Checkbox />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("peer");
    expect(button).toHaveClass("shrink-0");
    expect(button).toHaveClass("hover:scale-[1.05]");
    expect(button).toHaveClass("active:scale-[0.95]");
  });
});
