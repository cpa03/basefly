import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Questions } from "../questions";

describe("Questions Component", () => {
  it("renders default questions items from centralized tokens", () => {
    render(<Questions />);
    expect(screen.getByText("About Saasfly")).toBeInTheDocument();
    expect(screen.getByText("Why Next.js?")).toBeInTheDocument();
    expect(screen.getByText("Is this starter for you?")).toBeInTheDocument();
  });

  it("supports custom items passed via props", () => {
    const customItems = [
      {
        id: "custom-1",
        question: "Custom Question 1",
        answer: "Custom Answer 1",
      },
    ];
    render(<Questions items={customItems} />);
    expect(screen.getByText("Custom Question 1")).toBeInTheDocument();
  });

  it("applies aria-label attribute for accessibility", () => {
    const { container } = render(<Questions />);
    const accordionElement = container.querySelector('[aria-label="Frequently asked questions"]');
    expect(accordionElement).toBeInTheDocument();
  });
});
