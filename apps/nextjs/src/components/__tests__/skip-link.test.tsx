import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SkipLink } from "../skip-link";

describe("SkipLink", () => {
  it("renders with default text and target", () => {
    render(<SkipLink />);

    const link = screen.getByText("Skip to main content");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("renders with custom text", () => {
    render(<SkipLink>Custom skip text</SkipLink>);

    const link = screen.getByText("Custom skip text");
    expect(link).toBeInTheDocument();
  });

  it("renders with custom targetId", () => {
    render(<SkipLink targetId="custom-content" />);

    const link = screen.getByText("Skip to main content");
    expect(link).toHaveAttribute("href", "#custom-content");
  });

  it("applies custom className", () => {
    render(
      <SkipLink className="custom-class" />,
    );

    const link = screen.getByText("Skip to main content");
    expect(link.className).toContain("custom-class");
  });

  it("has sr-only class by default (visually hidden)", () => {
    render(<SkipLink />);

    const link = screen.getByText("Skip to main content");
    expect(link.className).toContain("sr-only");
  });

  it("calls focus and scrollIntoView on click when target exists", () => {
    // Set up DOM with target element
    const target = document.createElement("main");
    target.id = "main-content";
    document.body.appendChild(target);

    // Mock scrollIntoView
    const scrollIntoViewMock = vi.fn();
    target.scrollIntoView = scrollIntoViewMock;

    // Mock focus
    const focusMock = vi.fn();
    target.focus = focusMock;

    render(<SkipLink />);

    const link = screen.getByText("Skip to main content");
    fireEvent.click(link);

    expect(focusMock).toHaveBeenCalledWith({ preventScroll: false });
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });

    // Clean up
    document.body.removeChild(target);
  });

  it("does not throw when target element does not exist", () => {
    render(<SkipLink targetId="non-existent" />);

    const link = screen.getByText("Skip to main content");
    // Should not throw
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it("passes additional props to the anchor element", () => {
    render(<SkipLink data-testid="skip-link" aria-label="Skip" />);

    const link = screen.getByTestId("skip-link");
    expect(link).toHaveAttribute("aria-label", "Skip");
  });

  it("accepts and applies ref", () => {
    const ref = { current: null };
    render(<SkipLink ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});
