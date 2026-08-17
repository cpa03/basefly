import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select, SelectTrigger, SelectValue } from "./select";

describe("Select Component Tokens and Transitions", () => {
  it("should render SelectTrigger with design tokens and micro-interactions", () => {
    const { container } = render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Select plan" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = container.querySelector("button");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("custom-trigger");

    // Verify presence of SELECT_TOKENS trigger values
    expect(trigger).toHaveClass("group");
    expect(trigger).toHaveClass("flex");
    expect(trigger).toHaveClass("w-full");
    expect(trigger).toHaveClass("items-center");
    expect(trigger).toHaveClass("justify-between");
    expect(trigger).toHaveClass("hover:scale-[1.01]");
    expect(trigger).toHaveClass("active:scale-[0.99]");
  });

  it("should apply Chevron icon styles and rotation styles from tokens", () => {
    const { container } = render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("opacity-50");
    expect(svg).toHaveClass("transition-transform");
  });
});
