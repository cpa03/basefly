import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover Component", () => {
  it("should render the trigger and not the content when closed", () => {
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Open popover")).toBeInTheDocument();
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("should render the content when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("should render the content with dialog role when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("dialog")).toHaveTextContent("Popover content");
  });

  it("should apply base content classes", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveClass("z-50");
    expect(content).toHaveClass("w-72");
    expect(content).toHaveClass("rounded-md");
    expect(content).toHaveClass("border");
    expect(content).toHaveClass("bg-popover");
    expect(content).toHaveClass("shadow-md");
  });

  it("should apply custom className to the content", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent className="custom-popover-class">
          Popover content
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("custom-popover-class");
  });

  it("should render children inside the content", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>
          <p>First child</p>
          <button type="button">Action button</button>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Action button")).toBeInTheDocument();
  });
});
