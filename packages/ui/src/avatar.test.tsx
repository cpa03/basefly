import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar Component", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalHeight", {
      configurable: true,
      get: () => 100,
    });
    vi.restoreAllMocks();
  });

  it("should render children content", () => {
    render(<Avatar>Child</Avatar>);
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("should apply base avatar classes, aria-label fallback, and micro-interaction scale classes", () => {
    const { container } = render(<Avatar>Base</Avatar>);
    expect(container.firstChild).toHaveClass("rounded-full");
    expect(container.firstChild).toHaveClass("h-10");
    expect(container.firstChild).toHaveClass("w-10");
    expect(container.firstChild).toHaveClass("hover:scale-105");
    expect(container.firstChild).toHaveClass("active:scale-95");
    expect(container.firstChild).toHaveAttribute("aria-label", "User avatar");
  });

  it("should use custom aria-label when provided", () => {
    const { container } = render(<Avatar aria-label="Profile picture">Base</Avatar>);
    expect(container.firstChild).toHaveAttribute("aria-label", "Profile picture");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Avatar className="custom-test-class">X</Avatar>,
    );
    expect(container.firstChild).toHaveClass("custom-test-class");
  });

  it("should forward additional HTML attributes", () => {
    render(<Avatar data-testid="test-avatar">Attr</Avatar>);
    expect(screen.getByTestId("test-avatar")).toBeInTheDocument();
  });

  it("should render a fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should render an image when src is provided", () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="User avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const img = screen.getByRole("img", { name: "User avatar" });
    expect(img).toHaveAttribute("src", "/avatar.png");
  });

  it("should apply image classes", () => {
    render(
      <Avatar>
        <AvatarImage src="/a.png" alt="Avatar" />
      </Avatar>,
    );
    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toHaveClass("aspect-square");
    expect(img).toHaveClass("h-full");
    expect(img).toHaveClass("w-full");
  });
});
