import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTableEmpty } from "./data-table-empty";

describe("DataTableEmpty Component", () => {
  it("should render with the default title and status role", () => {
    render(<DataTableEmpty />);

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-label", "Empty state: No results found");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("should render a custom title", () => {
    render(<DataTableEmpty title="No clusters found" />);

    expect(
      screen.getByRole("status", { name: "Empty state: No clusters found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No clusters found")).toBeInTheDocument();
  });

  it("should render the description when provided", () => {
    render(
      <DataTableEmpty description="Get started by creating your first cluster." />,
    );

    expect(
      screen.getByText("Get started by creating your first cluster."),
    ).toBeInTheDocument();
  });

  it("should not render a description element when omitted", () => {
    render(<DataTableEmpty />);

    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("should render a custom action element", () => {
    render(
      <DataTableEmpty
        action={<button type="button">Create Cluster</button>}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Create Cluster" }),
    ).toBeInTheDocument();
  });

  it("should render a custom icon instead of the default search icon", () => {
    render(
      <DataTableEmpty
        icon={<span data-testid="custom-icon">Custom</span>}
      />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should render as a table cell with the correct colSpan", () => {
    const { container } = render(<DataTableEmpty colSpan={4} />);

    const cell = container.querySelector("td");
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute("colspan", "4");
  });

  it("should merge custom className into the cell", () => {
    const { container } = render(<DataTableEmpty className="custom-cell" />);

    const cell = container.querySelector("td");
    expect(cell).toHaveClass("custom-cell");
    expect(cell).toHaveClass("p-0");
  });
});