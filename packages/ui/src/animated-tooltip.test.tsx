import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ANIMATED_TOOLTIP_TOKENS } from "@saasfly/common";

import { AnimatedTooltip } from "./animated-tooltip";

// Mock next/image to render a plain <img> in the happy-dom test environment
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { alt, ...props }),
}));

const items = [
  {
    id: 1,
    name: "Alice",
    designation: "Frontend Engineer",
    image: "/avatars/alice.png",
    link: "https://example.com/alice",
  },
  {
    id: 2,
    name: "Bob",
    designation: "Backend Engineer",
    image: "/avatars/bob.png",
  },
];

describe("AnimatedTooltip Component", () => {
  it("should render an image for every item", () => {
    render(<AnimatedTooltip items={items} />);

    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("should set the alt text from the item name", () => {
    render(<AnimatedTooltip items={items} />);

    expect(screen.getByAltText("Alice")).toBeInTheDocument();
    expect(screen.getByAltText("Bob")).toBeInTheDocument();
  });

  it("should wrap linked items in an anchor with target _blank", () => {
    const { container } = render(<AnimatedTooltip items={items} />);

    const link = container.querySelector('a[href="https://example.com/alice"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should render non-linked items as plain images", () => {
    const { container } = render(<AnimatedTooltip items={items} />);

    const linked = container.querySelector(
      'a[href="https://example.com/alice"] img',
    );
    const images = container.querySelectorAll("img");
    // One image is inside the anchor (Alice), the other (Bob) is a plain <img>
    expect(images.length).toBe(2);
    expect(linked).toBeInTheDocument();
  });

  it("should show the tooltip with name and designation on hover", () => {
    render(<AnimatedTooltip items={items} />);

    expect(screen.queryByText("Frontend Engineer")).not.toBeInTheDocument();

    const aliceImage = screen.getByAltText("Alice");
    fireEvent.mouseEnter(aliceImage);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  });

  it("should only show the tooltip for the hovered item", () => {
    render(<AnimatedTooltip items={items} />);

    const aliceImage = screen.getByAltText("Alice");
    fireEvent.mouseEnter(aliceImage);

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
  });

  it("should apply region role and default aria-label for accessibility", () => {
    render(<AnimatedTooltip items={items} />);

    const container = screen.getByRole("region", {
      name: ANIMATED_TOOLTIP_TOKENS.defaultAriaLabel,
    });
    expect(container).toBeInTheDocument();
  });

  it("should allow custom role, aria-label, and className props", () => {
    render(
      <AnimatedTooltip
        items={items}
        role="group"
        aria-label="Custom team list"
        className="custom-tooltip-class"
      />,
    );

    const container = screen.getByRole("group", { name: "Custom team list" });
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("custom-tooltip-class");
  });
});
