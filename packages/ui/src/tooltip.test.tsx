import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip Component", () => {
  it("should render the trigger without the content when idle", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should show the content on focus", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    fireEvent.focus(screen.getByText("Hover me"));
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should show the content when open prop is set", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should apply trigger base classes, micro-UX transitions, and fallback aria-label", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Tooltip trigger" });
    expect(trigger).toHaveClass("inline-flex");
    expect(trigger).toHaveClass("hover:scale-[1.02]");
    expect(trigger).toHaveClass("active:scale-[0.98]");
    expect(trigger).toHaveAttribute("aria-label", "Tooltip trigger");
  });

  it("should preserve custom aria-label on trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger aria-label="Custom trigger label">Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Custom trigger label" });
    expect(trigger).toHaveAttribute("aria-label", "Custom trigger label");
  });

  it("should apply base content classes", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = screen.getByText("Tooltip text");
    expect(content).toHaveClass("z-50");
    expect(content).toHaveClass("rounded-md");
    expect(content).toHaveClass("border");
    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("px-3");
    expect(content).toHaveClass("py-1.5");
    expect(content).toHaveClass("text-sm");
  });

  it("should apply custom className to the content", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent className="custom-tooltip-class">
            Tooltip text
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("Tooltip text")).toHaveClass(
      "custom-tooltip-class",
    );
  });

  it("should apply the default sideOffset of 4", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const content = screen.getByText("Tooltip text");
    expect(content).toHaveAttribute("data-side", "top");
  });
});
