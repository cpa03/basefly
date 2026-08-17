import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render as a button element by default", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("should render children content", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });

  it("should apply default variant classes", () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.querySelector("button");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-primary-foreground");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Button className="custom-test-class">X</Button>,
    );
    expect(container.querySelector("button")).toHaveClass("custom-test-class");
  });

  it("should not set a default type attribute", () => {
    const { container } = render(<Button>Submit</Button>);
    const button = container.querySelector("button");
    expect(button).not.toHaveAttribute("type");
  });

  it("should be disabled when isLoading is true", () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const button = container.querySelector("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("should show a spinner when isLoading is true", () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should show loadingText instead of children when isLoading", () => {
    render(
      <Button isLoading loadingText="Please wait...">
        Hidden
      </Button>,
    );
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("should render children when isLoading is false", () => {
    render(<Button loadingText="Please wait...">Visible</Button>);
    expect(screen.getByText("Visible")).toBeInTheDocument();
    expect(screen.queryByText("Please wait...")).not.toBeInTheDocument();
  });

  it("should forward onClick handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("should create a ripple on click when ripple is enabled", () => {
    const { container } = render(<Button>Ripple</Button>);
    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(
      container.querySelector('[class*="animate-ripple"]'),
    ).toBeInTheDocument();
  });

  it("should not create a ripple when enableRipple is false", () => {
    const { container } = render(
      <Button enableRipple={false}>No Ripple</Button>,
    );
    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(
      container.querySelector('[class*="animate-ripple"]'),
    ).not.toBeInTheDocument();
  });

  it("should not create a ripple when isLoading is true", () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(
      container.querySelector('[class*="animate-ripple"]'),
    ).not.toBeInTheDocument();
  });

  it("should remove ripple after the ripple duration elapses", () => {
    const { container } = render(<Button>Ripple</Button>);
    const button = container.querySelector("button");
    fireEvent.click(button!);
    expect(
      container.querySelector('[class*="animate-ripple"]'),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      container.querySelector('[class*="animate-ripple"]'),
    ).not.toBeInTheDocument();
  });

  it("should forward ref to the underlying button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should forward additional HTML attributes", () => {
    render(<Button data-testid="custom-button">Attr</Button>);
    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("should render with a stable display name", () => {
    expect(Button.displayName).toBe("Button");
  });
});
