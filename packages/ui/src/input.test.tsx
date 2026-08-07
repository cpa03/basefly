import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./input";

describe("Input Component", () => {
  it("should render an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<Input className="custom-test-class" />);
    expect(container.querySelector("input")).toHaveClass("custom-test-class");
  });

  it("should forward value and placeholder", () => {
    render(<Input value="hello" placeholder="Type here" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("hello");
    expect(input).toHaveAttribute("placeholder", "Type here");
  });

  it("should render with specified type", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("should mark input as invalid when error is true", () => {
    render(<Input error />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should not mark input as invalid by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("should forward onChange handler", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("should disable the input when disabled is true", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("should apply readOnly attribute", () => {
    render(<Input readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("should not show clear button by default", () => {
    render(<Input value="text" />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("should show clear button when clearable and input has content", () => {
    render(<Input clearable value="content" />);
    expect(screen.getByLabelText("Clear input")).toBeInTheDocument();
  });

  it("should clear the input when clear button is clicked", () => {
    function ControlledInput() {
      const [value, setValue] = React.useState("content");
      return (
        <Input clearable value={value} onChange={(e) => setValue(e.target.value)} />
      );
    }
    render(<ControlledInput />);
    expect(screen.getByRole("textbox")).toHaveValue("content");
    fireEvent.click(screen.getByLabelText("Clear input"));
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("should not show clear button when input is disabled", () => {
    render(<Input clearable value="content" disabled />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("should not show clear button when input is readOnly", () => {
    render(<Input clearable value="content" readOnly />);
    expect(screen.queryByLabelText("Clear input")).not.toBeInTheDocument();
  });

  it("should forward additional HTML attributes", () => {
    render(<Input data-testid="test-input" />);
    expect(screen.getByTestId("test-input")).toBeInTheDocument();
  });
});
