import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DocsError from "../../app/[lang]/(docs)/error";
import EditorError from "../../app/[lang]/(editor)/error";

vi.mock("~/hooks/use-client-dictionary", () => ({
  useClientDictionary: () => ({ dict: null, isLoading: true }),
}));

vi.mock("~/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@saasfly/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe("DocsError route boundary", () => {
  it("renders fallback text and calls reset on click", () => {
    const reset = vi.fn();
    render(<DocsError error={new Error("boom")} reset={reset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(
      screen.getByText("An error occurred while loading the page."),
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(button);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});

describe("EditorError route boundary", () => {
  it("renders fallback text and calls reset on click", () => {
    const reset = vi.fn();
    render(<EditorError error={new Error("boom")} reset={reset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(
      screen.getByText("An error occurred while loading the page."),
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(button);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
