import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("should render the PENDING status", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("should render the RUNNING status", () => {
    render(<StatusBadge status="RUNNING" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("should render the STOPPED status", () => {
    render(<StatusBadge status="STOPPED" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });

  it("should render the CREATING status", () => {
    render(<StatusBadge status="CREATING" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Creating")).toBeInTheDocument();
  });

  it("should render the INITING status", () => {
    render(<StatusBadge status="INITING" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Initializing")).toBeInTheDocument();
  });

  it("should render the DELETED status", () => {
    render(<StatusBadge status="DELETED" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Deleted")).toBeInTheDocument();
  });

  it("should render without tooltip when showTooltip is false", () => {
    const { container } = render(<StatusBadge status="RUNNING" showTooltip={false} />);
    // Should render as a simple div without TooltipProvider wrapping
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    expect(container.querySelector('[data-state="instant-open"]')).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <StatusBadge status="PENDING" className="custom-class" showTooltip={false} />,
    );
    const badge = container.querySelector('[role="status"]');
    expect(badge).toHaveClass("custom-class");
  });

  it("should render with aria-label", () => {
    render(<StatusBadge status="RUNNING" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Running status");
  });

  it("should render small size", () => {
    const { container } = render(
      <StatusBadge status="PENDING" size="sm" showTooltip={false} />,
    );
    const badge = container.querySelector('[role="status"]');
    expect(badge).toBeInTheDocument();
  });

  it("should render large size", () => {
    const { container } = render(
      <StatusBadge status="PENDING" size="lg" showTooltip={false} />,
    );
    const badge = container.querySelector('[role="status"]');
    expect(badge).toBeInTheDocument();
  });
});
