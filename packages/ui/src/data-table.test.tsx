import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";

interface TestRow {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "status", header: "Status" },
];

const data: TestRow[] = [
  { id: "1", name: "Cluster A", status: "RUNNING" },
  { id: "2", name: "Cluster B", status: "STOPPED" },
];

function renderDataTable(cols: ColumnDef<TestRow, unknown>[], rows: TestRow[]) {
  return render(
    <DataTable columns={cols as ColumnDef<unknown, unknown>[]} data={rows} />,
  );
}

describe("DataTable Component", () => {
  it("should render column headers", () => {
    renderDataTable(columns, data);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render all data rows", () => {
    renderDataTable(columns, data);
    expect(screen.getByText("Cluster A")).toBeInTheDocument();
    expect(screen.getByText("Cluster B")).toBeInTheDocument();
    expect(screen.getByText("RUNNING")).toBeInTheDocument();
    expect(screen.getByText("STOPPED")).toBeInTheDocument();
  });

  it("should render the empty state when no data is provided", () => {
    renderDataTable(columns, []);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("should render custom cell content via accessor", () => {
    renderDataTable(columns, data);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
  });

  it("should apply the wrapper border class", () => {
    const { container } = renderDataTable(columns, data);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("rounded-md");
    expect(wrapper).toHaveClass("border");
  });
});
