import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ColourfulText } from "./colorful-text";

describe("ColourfulText Component", () => {
  it("should render each character of the text as a separate span", () => {
    const { container } = render(<ColourfulText text="abc" />);

    const spans = container.querySelectorAll("span.inline-block");
    expect(spans.length).toBe(3);
    expect(spans[0]?.textContent).toBe("a");
    expect(spans[1]?.textContent).toBe("b");
    expect(spans[2]?.textContent).toBe("c");
  });

  it("should preserve whitespace between words", () => {
    const { container } = render(<ColourfulText text="hi there" />);

    const spans = container.querySelectorAll("span.inline-block");
    expect(spans.length).toBe(8); // "hi there" = 2 chars + 1 space + 5 chars
    expect(spans[2]?.textContent).toBe(" ");
  });

  it("should render an empty string without spans", () => {
    const { container } = render(<ColourfulText text="" />);

    expect(container.querySelectorAll("span.inline-block").length).toBe(0);
  });

  it("should apply the typography classes to each character", () => {
    const { container } = render(<ColourfulText text="x" />);

    const span = container.querySelector("span.inline-block");
    expect(span).toHaveClass("font-sans");
    expect(span).toHaveClass("tracking-tight");
  });

  it("should render special characters correctly", () => {
    const { container } = render(<ColourfulText text="a!b" />);

    const spans = container.querySelectorAll("span.inline-block");
    expect(spans[1]?.textContent).toBe("!");
  });
});
