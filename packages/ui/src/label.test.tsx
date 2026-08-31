import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label Component", () => {
  it("should render children content", () => {
    render(<Label>Email address</Label>);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("should render with htmlFor attribute", () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });

  it("should apply base label classes and transition micro-UX", () => {
    const { container } = render(<Label>Base</Label>);
    expect(container.firstChild).toHaveClass("text-sm");
    expect(container.firstChild).toHaveClass("font-medium");
    expect(container.firstChild).toHaveClass("leading-none");
    expect(container.firstChild).toHaveClass("transition-colors");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Label className="custom-test-class">X</Label>,
    );
    expect(container.firstChild).toHaveClass("custom-test-class");
  });

  it("should forward additional HTML attributes", () => {
    render(<Label data-testid="test-label">Attr</Label>);
    expect(screen.getByTestId("test-label")).toBeInTheDocument();
  });
});
