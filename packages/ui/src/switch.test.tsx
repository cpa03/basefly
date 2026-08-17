import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SWITCH_TOKENS } from "@saasfly/common";

import { Switch } from "./switch";

describe("Switch Component", () => {
  it("should render successfully", () => {
    const { container } = render(<Switch />);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("should fallback to default aria-label if none is provided", () => {
    const { container } = render(<Switch />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute(
      "aria-label",
      SWITCH_TOKENS.defaultAriaLabel,
    );
  });

  it("should use explicitly provided aria-label", () => {
    const { container } = render(<Switch aria-label="Custom Toggle" />);
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("aria-label", "Custom Toggle");
  });

  it("should not override aria-label if aria-labelledby is provided", () => {
    const { container } = render(<Switch aria-labelledby="label-id" />);
    const button = container.querySelector("button");
    // If aria-labelledby is provided, aria-label is set to the props' aria-label (which is undefined/not set)
    expect(button).toHaveAttribute("aria-labelledby", "label-id");
  });

  it("should apply custom classNames", () => {
    const { container } = render(<Switch className="custom-test-class" />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("custom-test-class");
  });

  it("should apply Switch design tokens for track", () => {
    const { container } = render(<Switch />);
    const button = container.querySelector("button");
    expect(button).toHaveClass("peer");
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("hover:scale-[1.03]");
    expect(button).toHaveClass("active:scale-[0.97]");
  });

  it("should apply Switch design tokens for thumb", () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector("span");
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveClass("pointer-events-none");
    expect(thumb).toHaveClass("block");
    expect(thumb).toHaveClass("h-5");
    expect(thumb).toHaveClass("w-5");
  });
});
