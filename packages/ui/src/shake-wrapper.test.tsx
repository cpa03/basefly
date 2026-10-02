import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SHAKE_WRAPPER_TOKENS } from "@saasfly/common";

import { ShakeWrapper } from "./shake-wrapper";

describe("ShakeWrapper Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render children inside the wrapper", () => {
    render(
      <ShakeWrapper>
        <input aria-label="test-input" />
      </ShakeWrapper>,
    );

    expect(
      screen.getByRole("textbox", { name: "test-input" }),
    ).toBeInTheDocument();
  });

  it("should render a motion div by default", () => {
    const { container } = render(<ShakeWrapper>Content</ShakeWrapper>);

    // framer-motion renders a div for motion.div
    const wrapper = container.querySelector("div");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.textContent).toBe("Content");
  });

  it("should not call onShakeComplete when shake is false", () => {
    const onShakeComplete = vi.fn();
    render(
      <ShakeWrapper shake={false} onShakeComplete={onShakeComplete}>
        Content
      </ShakeWrapper>,
    );

    vi.advanceTimersByTime(1000);
    expect(onShakeComplete).not.toHaveBeenCalled();
  });

  it("should forward HTML attributes to the wrapper element", () => {
    const { container } = render(
      <ShakeWrapper data-testid="shake-root" aria-label="Shake me">
        Content
      </ShakeWrapper>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveAttribute("data-testid", "shake-root");
    expect(wrapper).toHaveAttribute("aria-label", "Shake me");
  });

  it("should merge custom className into the wrapper", () => {
    const { container } = render(
      <ShakeWrapper className="custom-shake">Content</ShakeWrapper>,
    );

    const wrapper = container.querySelector("div");
    expect(wrapper).toHaveClass("custom-shake");
  });

  it("should apply default accessibility role and aria-label", () => {
    render(<ShakeWrapper>Content</ShakeWrapper>);

    const region = screen.getByRole(SHAKE_WRAPPER_TOKENS.defaultRole, {
      name: SHAKE_WRAPPER_TOKENS.defaultAriaLabel,
    });
    expect(region).toBeInTheDocument();
  });

  it("should apply centralized token classes for focus base and default tabIndex", () => {
    const { container } = render(<ShakeWrapper>Content</ShakeWrapper>);

    const wrapper = container.querySelector("div");
    for (const tokenClass of SHAKE_WRAPPER_TOKENS.container.base.split(" ")) {
      expect(wrapper).toHaveClass(tokenClass);
    }
    expect(wrapper).toHaveAttribute(
      "tabindex",
      String(SHAKE_WRAPPER_TOKENS.defaultTabIndex),
    );
  });
});
