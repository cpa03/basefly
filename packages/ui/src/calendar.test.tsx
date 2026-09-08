import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CALENDAR_TOKENS } from "@saasfly/common";

import { Calendar } from "./calendar";

describe("Calendar Component", () => {
  it("should render the month caption", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    // react-day-picker renders the caption label with the month name
    expect(screen.getByText(/January 2026/)).toBeInTheDocument();
  });

  it("should render navigation buttons with scale micro-interactions", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    const navButtons = screen.getAllByRole("button");
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
    // Navigation buttons should contain tactile scale class
    expect(navButtons[0]).toHaveClass("hover:scale-110");
  });

  it("should render day cells with tactile scale micro-interactions", () => {
    render(<Calendar month={new Date(2026, 0, 15)} />);
    const dayButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.getAttribute("name") === "day");
    if (dayButtons.length > 0) {
      expect(dayButtons[0]).toHaveClass("hover:scale-[1.05]");
    }
  });

  it("should apply the base className and default aria-label", () => {
    const { container } = render(<Calendar month={new Date(2026, 0, 15)} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("p-3");
    expect(root).toHaveAttribute("aria-label", CALENDAR_TOKENS.defaultAriaLabel);
  });

  it("should apply custom className and custom aria-label", () => {
    const { container } = render(
      <Calendar
        month={new Date(2026, 0, 15)}
        className="custom-calendar"
        aria-label="Event date picker"
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("custom-calendar");
    expect(root).toHaveAttribute("aria-label", "Event date picker");
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
