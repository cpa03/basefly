import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardDescription,
  CardTitle,
  HoverEffect,
} from "./card-hover-effect";

const items = [
  {
    title: "First item",
    description: "Description of the first item",
    link: "https://example.com/first",
  },
  {
    title: "Second item",
    description: "Description of the second item",
    link: "https://example.com/second",
  },
  {
    title: "Third item",
    description: "Description of the third item",
    link: "https://example.com/third",
  },
];

describe("HoverEffect Component", () => {
  it("should render all provided items", () => {
    render(<HoverEffect items={items} />);

    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
    expect(screen.getByText("Third item")).toBeInTheDocument();
    expect(
      screen.getByText("Description of the first item"),
    ).toBeInTheDocument();
  });

  it("should render each item as a link with the item href", () => {
    const { container } = render(<HoverEffect items={items} />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "https://example.com/first");
    expect(links[2]).toHaveAttribute("href", "https://example.com/third");
  });

  it("should merge custom className into the grid container", () => {
    const { container } = render(
      <HoverEffect items={items} className="custom-grid" />,
    );

    const grid = container.firstElementChild as HTMLElement;
    expect(grid).toHaveClass("custom-grid");
  });

  it("should show the hover background when an item is hovered", () => {
    const { container } = render(<HoverEffect items={items} />);

    const links = container.querySelectorAll("a");
    expect(container.querySelector(".rounded-3xl")).not.toBeInTheDocument();

    fireEvent.mouseEnter(links[0]!);

    const background = container.querySelector(".rounded-3xl");
    expect(background).toBeInTheDocument();
    expect(background?.className).toContain("bg-neutral-200");
  });

  it("should fade out the hover background on mouse leave", () => {
    const { container } = render(<HoverEffect items={items} />);

    const links = container.querySelectorAll("a");
    fireEvent.mouseEnter(links[0]!);
    const background = container.querySelector(".rounded-3xl");
    expect(background).toBeInTheDocument();

    fireEvent.mouseLeave(links[0]!);
    expect(background).toHaveStyle("opacity: 0");
  });

  it("should only highlight the hovered item", () => {
    const { container } = render(<HoverEffect items={items} />);

    const links = container.querySelectorAll("a");
    fireEvent.mouseEnter(links[1]!);

    expect(container.querySelector(".rounded-3xl")).toBeInTheDocument();
  });
});

describe("Card / CardTitle / CardDescription Components", () => {
  it("should render children inside the card", () => {
    render(
      <Card>
        <span>Card content</span>
      </Card>,
    );

    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("should merge custom className into the card", () => {
    const { container } = render(
      <Card className="custom-card">
        <span>Card content</span>
      </Card>,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("custom-card");
  });

  it("should render the title text", () => {
    render(<CardTitle>My title</CardTitle>);

    const title = screen.getByText("My title");
    expect(title.tagName).toBe("H4");
  });

  it("should merge custom className into the title", () => {
    const { container } = render(
      <CardTitle className="custom-title">My title</CardTitle>,
    );

    const title = container.querySelector("h4");
    expect(title).toHaveClass("custom-title");
  });

  it("should render the description text in a paragraph", () => {
    render(<CardDescription>My description</CardDescription>);

    const description = screen.getByText("My description");
    expect(description.tagName).toBe("P");
  });

  it("should merge custom className into the description", () => {
    const { container } = render(
      <CardDescription className="custom-desc">My description</CardDescription>,
    );

    const description = container.querySelector("p");
    expect(description).toHaveClass("custom-desc");
  });
});
