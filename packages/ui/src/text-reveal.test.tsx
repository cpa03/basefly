import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextRevealByWord } from "./text-reveal";

describe("TextRevealByWord Component", () => {
  it("should render the provided text split into words", () => {
    render(<TextRevealByWord text="Hello world" />);

    // Each word appears twice (absolute opacity-30 + motion span)
    expect(screen.getAllByText("Hello").length).toBeGreaterThan(0);
    expect(screen.getAllByText("world").length).toBeGreaterThan(0);
  });

  it("should render each word inside a Word wrapper span", () => {
    const { container } = render(<TextRevealByWord text="one two three" />);

    // 3 words -> 3 Word wrappers with relative positioning
    const wordWrappers = container.querySelectorAll(".relative");
    expect(wordWrappers.length).toBeGreaterThanOrEqual(3);
  });

  it("should render the sticky container with scroll layout", () => {
    const { container } = render(<TextRevealByWord text="Hello" />);

    const stickyDiv = container.querySelector(".sticky");
    expect(stickyDiv).toBeInTheDocument();
  });

  it("should merge custom className into the outer container", () => {
    const { container } = render(
      <TextRevealByWord text="Hello" className="custom-reveal" />,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("custom-reveal");
  });

  it("should render the paragraph with flex-wrap layout", () => {
    const { container } = render(<TextRevealByWord text="Hello" />);

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.className).toContain("flex");
    expect(paragraph?.className).toContain("flex-wrap");
  });
});
