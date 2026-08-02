import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClusterListSkeleton } from "../dashboard/cluster-list-skeleton";

describe("ClusterListSkeleton", () => {
  it("renders a loading container with aria-busy set", () => {
    const { container } = render(<ClusterListSkeleton />);

    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).toBeInTheDocument();
  });

  it("exposes an accessible loading label", () => {
    render(<ClusterListSkeleton />);

    expect(screen.getByLabelText("Loading cluster data")).toBeInTheDocument();
  });

  it("renders skeleton placeholder cells for the table header", () => {
    const { container } = render(<ClusterListSkeleton />);

    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).toBeInTheDocument();

    const headerRow = container.querySelector("thead tr");
    expect(headerRow).not.toBeNull();
    expect(headerRow!.querySelectorAll("th").length).toBe(6);
  });

  it("renders 5 table body rows", () => {
    const { container } = render(<ClusterListSkeleton />);

    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(5);
  });

  it("renders 6 columns per body row", () => {
    const { container } = render(<ClusterListSkeleton />);

    const firstRow = container.querySelector("tbody tr");
    expect(firstRow).not.toBeNull();
    const cells = firstRow!.querySelectorAll("td");
    expect(cells.length).toBe(6);
  });

  it("renders skeleton placeholders inside cells", () => {
    const { container } = render(<ClusterListSkeleton />);

    const firstCell = container.querySelector("tbody tr td");
    expect(firstCell).not.toBeNull();
    expect(firstCell!.querySelectorAll("div")).not.toHaveLength(0);
  });

  it("renders a table element", () => {
    const { container } = render(<ClusterListSkeleton />);

    expect(container.querySelector("table")).toBeInTheDocument();
  });
});
