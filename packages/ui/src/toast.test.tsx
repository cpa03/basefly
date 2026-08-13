import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

describe("Toast Component", () => {
  it("should render the toast title and description", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Toast title</ToastTitle>
          <ToastDescription>Toast description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Toast title")).toBeInTheDocument();
    expect(screen.getByText("Toast description")).toBeInTheDocument();
  });

  it("should render a close button with an accessible label", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Toast title</ToastTitle>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByLabelText("Dismiss notification")).toBeInTheDocument();
  });

  it("should render the action element", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Toast title</ToastTitle>
          <ToastAction altText="Undo">Undo</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("should apply the default variant classes", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Toast title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    const toast = screen.getByText("Toast title").closest("li");
    expect(toast).not.toBeNull();
    expect(toast).toHaveClass("bg-background");
    expect(toast).toHaveClass("border");
  });

  it("should apply the destructive variant classes", () => {
    render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Toast title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    const toast = screen.getByText("Toast title").closest("li");
    expect(toast).not.toBeNull();
    expect(toast).toHaveClass("border-destructive");
    expect(toast).toHaveClass("bg-destructive");
  });

  it("should apply custom className to the toast", () => {
    render(
      <ToastProvider>
        <Toast open className="custom-toast-class">
          <ToastTitle>Toast title</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );
    const toast = screen.getByText("Toast title").closest("li");
    expect(toast).toHaveClass("custom-toast-class");
  });

  it("should render the viewport with positioning classes", () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>,
    );
    const viewport = container.querySelector("ol") as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(viewport).toHaveClass("fixed");
    expect(viewport).toHaveClass("top-0");
  });
});
