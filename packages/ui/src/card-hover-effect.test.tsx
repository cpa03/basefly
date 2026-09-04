import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, CardDescription, CardTitle, HoverEffect } from "./card-hover-effect";

describe("HoverEffect Card", () => {
  const sampleItems = [
    {
      title: "Feature 1",
      description: "Description 1",
      link: "/feature-1",
    },
    {
      title: "Feature 2",
      description: "Description 2",
      link: "/feature-2",
    },
  ];

  it("renders card hover effect items with accessibility labels and token classes", () => {
    render(<HoverEffect items={sampleItems} />);

    const link1 = screen.getByRole("link", { name: "Feature 1" });
    expect(link1).toBeDefined();
    expect(link1.getAttribute("href")).toBe("/feature-1");
    expect(link1.className).toContain("hover:scale-[1.01]");
    expect(link1.className).toContain("active:scale-[0.99]");
  });

  it("renders Card, CardTitle, and CardDescription with token classes", () => {
    render(
      <Card className="custom-card">
        <CardTitle className="custom-title">Title</CardTitle>
        <CardDescription className="custom-desc">Desc</CardDescription>
      </Card>,
    );

    const titleElement = screen.getByText("Title");
    expect(titleElement.className).toContain("font-bold");
    expect(titleElement.className).toContain("custom-title");

    const descElement = screen.getByText("Desc");
    expect(descElement.className).toContain("text-zinc-400");
    expect(descElement.className).toContain("custom-desc");
  });
});
