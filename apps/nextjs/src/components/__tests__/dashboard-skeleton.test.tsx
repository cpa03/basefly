import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardSkeleton } from "../dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders a loading container with aria-busy set", () => {
    const { container } = render(<DashboardSkeleton />);

    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).toBeInTheDocument();
  });

  it("exposes an accessible loading label", () => {
    render(<DashboardSkeleton />);

    expect(screen.getByLabelText("Loading dashboard data")).toBeInTheDocument();
  });

  it("renders a table element", () => {
    const { container } = render(<DashboardSkeleton />);

    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("renders 5 table body rows", () => {
    const { container } = render(<DashboardSkeleton />);

    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(5);
  });

  it("renders 6 columns per body row", () => {
    const { container } = render(<DashboardSkeleton />);

    const firstRow = container.querySelector("tbody tr");
    expect(firstRow).not.toBeNull();
    const cells = firstRow!.querySelectorAll("td");
    expect(cells.length).toBe(6);
  });

  it("renders skeleton placeholders inside cells", () => {
    const { container } = render(<DashboardSkeleton />);

    const firstCell = container.querySelector("tbody tr td");
    expect(firstCell).not.toBeNull();
    expect(firstCell!.querySelectorAll("div")).not.toHaveLength(0);
  });
});
