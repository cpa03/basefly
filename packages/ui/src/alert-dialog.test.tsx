import React from "react";
import { ALERT_DIALOG_TOKENS } from "@saasfly/common";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

describe("AlertDialog Component", () => {
  it("should render the trigger and not the content when closed", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Delete item")).toBeInTheDocument();
    expect(screen.queryByText("Confirm deletion")).not.toBeInTheDocument();
  });

  it("should render the content when open", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Confirm deletion")).toBeInTheDocument();
    expect(
      screen.getByText("This action cannot be undone."),
    ).toBeInTheDocument();
  });

  it("should render the content with alertdialog role and aria-modal", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const content = screen.getByRole("alertdialog");
    expect(content).toHaveAttribute("aria-modal", "true");
    expect(content).toHaveTextContent("Confirm deletion");
  });

  it("should apply base content classes", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const content = screen.getByRole("alertdialog");
    expect(content).toHaveClass("fixed");
    expect(content).toHaveClass("border");
    expect(content).toHaveClass("bg-background");
    expect(content).toHaveClass("shadow-lg");
  });

  it("should apply custom className to the content", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent className="custom-alert-class">
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByRole("alertdialog")).toHaveClass("custom-alert-class");
  });

  it("should render header, footer, action, and cancel with spring scale micro-interactions", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const cancelBtn = screen.getByText("Cancel");
    const actionBtn = screen.getByText("Delete");

    expect(cancelBtn).toBeInTheDocument();
    expect(actionBtn).toBeInTheDocument();

    expect(cancelBtn).toHaveClass(ALERT_DIALOG_TOKENS.cancel.hoverScale);
    expect(cancelBtn).toHaveClass(ALERT_DIALOG_TOKENS.cancel.activeScale);

    expect(actionBtn).toHaveClass(ALERT_DIALOG_TOKENS.action.hoverScale);
    expect(actionBtn).toHaveClass(ALERT_DIALOG_TOKENS.action.activeScale);
  });

  it("should render action and cancel as buttons", () => {
    render(
      <AlertDialog open>
        <AlertDialogTrigger>Delete item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Cancel").tagName).toBe("BUTTON");
    expect(screen.getByText("Delete").tagName).toBe("BUTTON");
  });
});
