import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table Component", () => {
  it("should render a table element with base classes", () => {
    const { container } = render(<Table />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass("w-full");
    expect(table).toHaveClass("caption-bottom");
    expect(table).toHaveClass("text-sm");
  });

  it("should apply custom className to the table", () => {
    const { container } = render(<Table className="custom-table-class" />);
    expect(container.querySelector("table")).toHaveClass("custom-table-class");
  });

  it("should wrap the table in an overflow-auto container", () => {
    const { container } = render(<Table />);
    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("overflow-auto");
  });

  it("should render table header with children", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Name").tagName).toBe("TH");
  });

  it("should render table body with rows and cells", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cluster A</TableCell>
            <TableCell>Running</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText("Cluster A")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Cluster A").tagName).toBe("TD");
  });

  it("should apply header cell base classes", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const th = container.querySelector("th");
    expect(th).toHaveClass("h-12");
    expect(th).toHaveClass("px-4");
    expect(th).toHaveClass("text-left");
    expect(th).toHaveClass("font-medium");
  });

  it("should apply cell base classes", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const td = container.querySelector("td");
    expect(td).toHaveClass("p-4");
    expect(td).toHaveClass("align-middle");
  });

  it("should apply disabled styles and spring scale classes to a row", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow disabled>
            <TableCell>Disabled</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const tr = container.querySelector("tr");
    expect(tr).toHaveClass("hover:scale-[1.002]");
    expect(tr).toHaveClass("active:scale-[0.998]");
    expect(tr).toHaveClass("pointer-events-none");
    expect(tr).toHaveClass("opacity-80");
  });

  it("should render a footer with footer classes", () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const tfoot = container.querySelector("tfoot");
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveClass("bg-primary");
    expect(tfoot).toHaveClass("font-medium");
  });

  it("should render a caption with caption classes", () => {
    const { container } = render(
      <Table>
        <TableCaption>Cluster inventory</TableCaption>
      </Table>,
    );
    const caption = container.querySelector("caption");
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent("Cluster inventory");
    expect(caption).toHaveClass("mt-4");
    expect(caption).toHaveClass("text-sm");
  });

  it("should apply custom className to rows, cells, and headers", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow className="custom-row">
            <TableHead className="custom-head">H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="custom-row">
            <TableCell className="custom-cell">C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelectorAll("tr.custom-row")).toHaveLength(2);
    expect(container.querySelector("th.custom-head")).toBeInTheDocument();
    expect(container.querySelector("td.custom-cell")).toBeInTheDocument();
  });
});
