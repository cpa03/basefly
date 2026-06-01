import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyPlaceholder } from "../empty-placeholder";

// Mock @saasfly/ui/icons which re-exports from lucide-react.
vi.mock("@saasfly/ui/icons", () => ({
  Activity: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-activity" className={(props as Record<string, string>)?.className} />
  ),
  Rocket: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-rocket" className={(props as Record<string, string>)?.className} />
  ),
  FileText: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-file-text" className={(props as Record<string, string>)?.className} />
  ),
  Settings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-settings" className={(props as Record<string, string>)?.className} />
  ),
}));

describe("EmptyPlaceholder", () => {
  it("renders children inside the container", () => {
    render(
      <EmptyPlaceholder>
        <span>Test content</span>
      </EmptyPlaceholder>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders with role status and aria-label", () => {
    render(
      <EmptyPlaceholder>
        <span>Content</span>
      </EmptyPlaceholder>,
    );

    const container = screen.getByRole("status");
    expect(container).toHaveAttribute("aria-label", "No content available");
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyPlaceholder className="custom-class">
        <span>Content</span>
      </EmptyPlaceholder>,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("custom-class");
  });

  it("passes additional props to the container", () => {
    render(
      <EmptyPlaceholder data-testid="placeholder">
        <span>Content</span>
      </EmptyPlaceholder>,
    );

    expect(screen.getByTestId("placeholder")).toBeInTheDocument();
  });
});

describe("EmptyPlaceholder.Icon", () => {
  it("renders with a valid icon name", () => {
    render(<EmptyPlaceholder.Icon name="Rocket" />);

    expect(screen.getByTestId("icon-rocket")).toBeInTheDocument();
  });

  it("renders with different valid icon names", () => {
    const { rerender } = render(<EmptyPlaceholder.Icon name="Activity" />);
    expect(screen.getByTestId("icon-activity")).toBeInTheDocument();

    rerender(<EmptyPlaceholder.Icon name="FileText" />);
    expect(screen.getByTestId("icon-file-text")).toBeInTheDocument();
  });
});

describe("EmptyPlaceholder.Title", () => {
  it("renders the title text", () => {
    render(<EmptyPlaceholder.Title>Test Title</EmptyPlaceholder.Title>);

    const heading = screen.getByText("Test Title");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("applies custom className", () => {
    render(
      <EmptyPlaceholder.Title className="custom-title-class">
        Title
      </EmptyPlaceholder.Title>,
    );

    const heading = screen.getByText("Title");
    expect(heading.className).toContain("custom-title-class");
  });
});

describe("EmptyPlaceholder.Description", () => {
  it("renders the description text", () => {
    render(
      <EmptyPlaceholder.Description>
        Test description
      </EmptyPlaceholder.Description>,
    );

    const paragraph = screen.getByText("Test description");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.tagName).toBe("P");
  });

  it("applies custom className", () => {
    render(
      <EmptyPlaceholder.Description className="custom-desc-class">
        Description
      </EmptyPlaceholder.Description>,
    );

    const paragraph = screen.getByText("Description");
    expect(paragraph.className).toContain("custom-desc-class");
  });
});
