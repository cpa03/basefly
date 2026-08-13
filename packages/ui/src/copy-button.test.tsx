import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

describe("CopyButton Component", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    // happy-dom exposes navigator.clipboard as a getter-only property, so we
    // must use defineProperty instead of direct assignment.
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the button with a copy icon", () => {
    render(<CopyButton value="secret-value" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      "aria-label",
      "Copy to clipboard: secret-value",
    );
  });

  it("should copy the value to the clipboard on click", async () => {
    writeText.mockResolvedValue(undefined);
    render(<CopyButton value="secret-value" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("secret-value");
    });
  });

  it("should show the success state after copying", async () => {
    writeText.mockResolvedValue(undefined);
    render(<CopyButton value="secret-value" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("should call onCopy with the value after a successful copy", async () => {
    writeText.mockResolvedValue(undefined);
    const onCopy = vi.fn();
    render(<CopyButton value="secret-value" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith("secret-value");
    });
  });

  it("should call onError when the clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const onError = vi.fn();
    render(<CopyButton value="secret-value" onError={onError} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("should be disabled when no value is provided", () => {
    render(<CopyButton value="" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should be disabled when the disabled prop is set", () => {
    render(<CopyButton value="secret-value" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should support custom aria-label", () => {
    render(<CopyButton value="secret-value" aria-label="Copy API key" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Copy API key",
    );
  });

  it("should not render a tooltip when showTooltip is false", () => {
    render(<CopyButton value="secret-value" showTooltip={false} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Copy to clipboard");
  });
});
