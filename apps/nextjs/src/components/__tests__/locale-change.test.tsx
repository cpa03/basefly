import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocaleChange } from "../locale-change";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("LocaleChange Component", () => {
  it("should render the language toggle button with accessible aria-label", () => {
    render(<LocaleChange url="dashboard" currentLocale="en" />);
    const button = screen.getByRole("button", {
      name: /Change language\. Current: English/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("should apply tactile spring scale micro-interaction transition classes to the trigger button", () => {
    render(<LocaleChange url="dashboard" currentLocale="en" />);
    const button = screen.getByRole("button", {
      name: /Change language\. Current: English/i,
    });
    expect(button).toHaveClass("hover:scale-105");
    expect(button).toHaveClass("active:scale-95");
    expect(button).toHaveClass("transition-transform");
  });

  it("should render fallback aria-label when currentLocale is unknown or empty", () => {
    render(<LocaleChange url="dashboard" />);
    const button = screen.getByRole("button", {
      name: /Change language\. Current: unknown/i,
    });
    expect(button).toBeInTheDocument();
  });
});
