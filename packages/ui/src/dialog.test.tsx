import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog Component", () => {
  it("should render the trigger and not the content when closed", () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Open dialog")).toBeInTheDocument();
    expect(screen.queryByText("Dialog title")).not.toBeInTheDocument();
  });

  it("should open the dialog when the trigger is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("Open dialog"));
    expect(screen.getByText("Dialog title")).toBeInTheDocument();
    expect(screen.getByText("Dialog description")).toBeInTheDocument();
  });

  it("should render the dialog content with aria-modal", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveAttribute("aria-modal", "true");
    expect(content).toHaveTextContent("Dialog title");
  });

  it("should render a close button with aria-label Close", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("should apply base content classes", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const content = screen.getByRole("dialog");
    expect(content).toHaveClass("fixed");
    expect(content).toHaveClass("bg-background");
    expect(content).toHaveClass("shadow-lg");
  });

  it("should apply custom className to the content", () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog-class">
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("custom-dialog-class");
  });

  it("should render header, title, description, and footer", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button">Cancel</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should close the dialog when the close button is clicked", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Dialog title")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByText("Dialog title")).not.toBeInTheDocument();
  });
});