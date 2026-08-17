import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet Component", () => {
  it("should render the trigger and not the content when closed", () => {
    render(
      <Sheet>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Open sheet")).toBeInTheDocument();
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("should render the content when open", () => {
    render(
      <Sheet open>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("should render the content with aria-modal", () => {
    render(
      <Sheet open>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveAttribute("aria-modal", "true");
    expect(content).toHaveTextContent("Sheet content");
  });

  it("should apply default size classes for the right position", () => {
    render(
      <Sheet open>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveClass("fixed");
    expect(content).toHaveClass("bg-background");
    expect(content).toHaveClass("w-1/3");
  });

  it("should apply size and position variant classes", () => {
    render(
      <Sheet open>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent position="left" size="sm">
          Sheet content
        </SheetContent>
      </Sheet>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveClass("h-full");
    expect(content).toHaveClass("w-1/4");
  });

  it("should apply custom className to the content", () => {
    render(
      <Sheet open>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent className="custom-sheet-class">
          Sheet content
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("custom-sheet-class");
  });

  it("should render a close button with aria-label Close and close on click", () => {
    render(
      <Sheet defaultOpen>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("should render header, title, description, and footer", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button type="button">Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Sheet title")).toBeInTheDocument();
    expect(screen.getByText("Sheet description")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should render a SheetClose child that closes the sheet on click", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <p>Sheet content</p>
          <SheetClose asChild>
            <button type="button">Dismiss</button>
          </SheetClose>
        </SheetContent>
      </Sheet>,
    );
    fireEvent.click(screen.getByText("Dismiss"));
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });
});
