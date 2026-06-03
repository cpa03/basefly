import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render with aria-busy attribute", () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole("generic", { busy: true });
    expect(skeleton).toBeInTheDocument();
  });

  it("should render with loading aria-label", () => {
    render(<Skeleton />);
    expect(screen.getByLabelText("Loading...")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain("custom-class");
  });

  it("should render with shimmer animation by default", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain("animate-shimmer");
  });

  it("should disable shimmer when shimmer=false", () => {
    const { container } = render(<Skeleton shimmer={false} />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).not.toContain("animate-shimmer");
  });

  it("should forward additional HTML attributes", () => {
    render(<Skeleton data-testid="test-skeleton" />);
    expect(screen.getByTestId("test-skeleton")).toBeInTheDocument();
  });

  it("should render with base rounded-md class", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain("rounded-md");
  });
});
