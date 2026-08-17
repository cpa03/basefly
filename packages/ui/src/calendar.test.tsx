import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Calendar } from "./calendar";

describe("Calendar Component", () => {
  it("should render the month caption", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    // react-day-picker renders the caption label with the month name
    expect(screen.getByText(/January 2026/)).toBeInTheDocument();
  });

  it("should render navigation buttons", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    const navButtons = screen.getAllByRole("button");
    // Previous month, next month, and any day buttons
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("should render day cells for the month", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    const dayCells = screen.getAllByRole("gridcell");
    expect(dayCells.length).toBeGreaterThanOrEqual(28);
  });

  it("should apply the base className", () => {
    const { container } = render(<Calendar month={new Date(2026, 0, 15)} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("p-3");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Calendar month={new Date(2026, 0, 15)} className="custom-calendar" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("custom-calendar");
  });

  it("should render the selected day with aria-selected", () => {
    render(
      <Calendar
        month={new Date(2026, 0, 15)}
        selected={new Date(2026, 0, 15)}
        mode="single"
      />,
    );
    const selected = screen
      .getAllByRole("gridcell")
      .find((cell) => cell.getAttribute("aria-selected") === "true");
    expect(selected).toBeDefined();
    expect(selected).toHaveTextContent("15");
  });
});
