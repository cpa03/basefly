import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./textarea";

describe("Textarea Component", () => {
  it("should render a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Textarea className="custom-textarea-class" />,
    );
    expect(container.querySelector("textarea")).toHaveClass(
      "custom-textarea-class",
    );
  });

  it("should forward value and placeholder", () => {
    render(
      <Textarea
        value="hello textarea"
        placeholder="Enter text here"
        readOnly
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("hello textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter text here");
  });

  it("should mark textarea as invalid when error is true", () => {
    render(<Textarea error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should respect explicit aria-invalid when error is not provided", () => {
    render(<Textarea aria-invalid="true" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should fallback to default aria-label for accessibility", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-label",
      "Text area input",
    );
  });

  it("should respect explicit aria-label", () => {
    render(<Textarea aria-label="My custom label" />);
    expect(screen.getByRole("textbox")).toHaveAttribute(
      "aria-label",
      "My custom label",
    );
  });

  it("should forward onChange handler", () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "new text" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("should disable the textarea when disabled is true", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should apply readOnly attribute", () => {
    render(<Textarea readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("should forward additional HTML attributes", () => {
    render(<Textarea data-testid="test-textarea" />);
    expect(screen.getByTestId("test-textarea")).toBeInTheDocument();
  });
});
