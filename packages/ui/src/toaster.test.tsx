import React from "react";
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Toaster as ToasterType } from "./toaster";
import type { toast as toastType } from "./use-toast";

let Toaster: typeof ToasterType;
let toast: typeof toastType;

beforeEach(async () => {
  // use-toast holds module-level toast state; reset modules so each test
  // starts with an empty toast queue.
  vi.resetModules();
  ({ Toaster } = await import("./toaster"));
  ({ toast } = await import("./use-toast"));
});

describe("Toaster Component", () => {
  it("should render the viewport when no toasts exist", () => {
    render(<Toaster />);
    expect(document.querySelector("ol")).not.toBeNull();
  });

  it("should render a toast with title and description", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Saved", description: "Changes saved successfully" });
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Changes saved successfully")).toBeInTheDocument();
  });

  it("should render a toast with an action", () => {
    render(<Toaster />);
    act(() => {
      toast({
        title: "Action toast",
        action: <button type="button">Retry</button>,
      });
    });
    expect(screen.getByText("Action toast")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should render a close button for each toast", () => {
    render(<Toaster />);
    act(() => {
      toast({ title: "Dismissible" });
    });
    expect(screen.getByLabelText("Dismiss notification")).toBeInTheDocument();
  });
});
