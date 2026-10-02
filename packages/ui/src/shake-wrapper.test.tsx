import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANIMATION, SHAKE_WRAPPER_TOKENS } from "@saasfly/common";

import { ShakeWrapper } from "./shake-wrapper";

const { useReducedMotionMock, capturedMotionProps } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn(() => false),
  capturedMotionProps: [] as Record<string, unknown>[],
}));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  const ReactModule = await import("react");

  // Motion-only props that must not leak onto the rendered DOM element.
  const motionOnlyKeys = [
    "animate",
    "whileHover",
    "whileTap",
    "transition",
    "initial",
    "exit",
    "variants",
  ];

  const MotionDiv = ReactModule.forwardRef<
    HTMLDivElement,
    Record<string, unknown>
  >((props, ref) => {
    // Capture the exact props ShakeWrapper passes to motion.div so tests can
    // assert gesture/transition wiring that is not visible in the DOM.
    capturedMotionProps.push(props);
    const domProps: Record<string, unknown> = { ...props };
    for (const key of motionOnlyKeys) {
      delete domProps[key];
    }
    return ReactModule.createElement("div", {
      ...domProps,
      ref,
    } as React.HTMLAttributes<HTMLDivElement>);
  });
  MotionDiv.displayName = "MockMotionDiv";

  return {
    ...actual,
    motion: { div: MotionDiv },
    useReducedMotion: useReducedMotionMock,
  };
});

describe("ShakeWrapper Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useReducedMotionMock.mockReturnValue(false);
    capturedMotionProps.length = 0;
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
    expect(capturedMotionProps).toHaveLength(1);
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

  it("should apply default role without inventing an accessible name", () => {
    render(<ShakeWrapper>Content</ShakeWrapper>);

    const group = screen.getByRole(SHAKE_WRAPPER_TOKENS.defaultRole);
    expect(group).toBeInTheDocument();
    // No fallback label: every FormItem-wrapped field would otherwise share one name.
    expect(group).not.toHaveAttribute("aria-label");
  });

  it("wires token focus classes onto the wrapper without adding a default tab stop", () => {
    const { container } = render(<ShakeWrapper>Content</ShakeWrapper>);

    const wrapper = container.querySelector("div");
    for (const tokenClass of SHAKE_WRAPPER_TOKENS.container.base.split(" ")) {
      expect(wrapper).toHaveClass(tokenClass);
    }
    // The wrapper is not focusable by default (no extra tab stop per form field);
    // these classes engage only when a consumer supplies tabIndex (asserted below).
    expect(wrapper).not.toHaveAttribute("tabindex");
  });

  it("should not have tabindex by default but accept consumer-supplied tabIndex", () => {
    const { container: containerDefault } = render(
      <ShakeWrapper>Content</ShakeWrapper>,
    );
    const wrapperDefault = containerDefault.querySelector("div");
    expect(wrapperDefault).not.toHaveAttribute("tabindex");

    const { container: containerWithTabIndex } = render(
      <ShakeWrapper tabIndex={0}>Content</ShakeWrapper>,
    );
    const wrapperWithTabIndex = containerWithTabIndex.querySelector("div");
    expect(wrapperWithTabIndex).toHaveAttribute("tabindex", "0");
  });

  describe("reduced motion branch", () => {
    beforeEach(() => {
      useReducedMotionMock.mockReturnValue(true);
    });

    it("should render a plain div when reduced motion is preferred", () => {
      const { container } = render(<ShakeWrapper>Content</ShakeWrapper>);

      const wrapper = container.querySelector("div");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.textContent).toBe("Content");
      // Reduced motion renders no framer-motion element at all.
      expect(capturedMotionProps).toHaveLength(0);
    });

    it("should apply role and token classes in reduced motion mode without a default name", () => {
      render(<ShakeWrapper>Content</ShakeWrapper>);

      const group = screen.getByRole(SHAKE_WRAPPER_TOKENS.defaultRole);
      expect(group).toBeInTheDocument();
      expect(group).not.toHaveAttribute("aria-label");

      const wrapper = group.closest("div");
      expect(wrapper).toHaveClass(
        ...SHAKE_WRAPPER_TOKENS.container.base.split(" "),
      );
    });

    it("should not have tabindex by default in reduced motion mode", () => {
      const { container } = render(<ShakeWrapper>Content</ShakeWrapper>);
      const wrapper = container.querySelector("div");
      expect(wrapper).not.toHaveAttribute("tabindex");
    });

    it("should accept consumer-supplied tabIndex in reduced motion mode", () => {
      const { container } = render(
        <ShakeWrapper tabIndex={0}>Content</ShakeWrapper>,
      );
      const wrapper = container.querySelector("div");
      expect(wrapper).toHaveAttribute("tabindex", "0");
    });
  });

  describe("motion branch gesture props", () => {
    it("wires whileHover scale from tokens and defines no whileTap gesture", () => {
      render(<ShakeWrapper>Content</ShakeWrapper>);

      expect(capturedMotionProps).toHaveLength(1);
      const [motionProps] = capturedMotionProps;
      expect(motionProps?.["whileHover"]).toEqual({
        scale: SHAKE_WRAPPER_TOKENS.motion.hoverScale,
      });
      expect(motionProps).not.toHaveProperty("whileTap");
    });

    it("keeps shake x timing while giving the hover scale its own fast transition", () => {
      render(<ShakeWrapper>Content</ShakeWrapper>);

      const [motionProps] = capturedMotionProps;
      expect(motionProps?.["transition"]).toEqual({
        duration: ANIMATION.shake.transition.duration,
        ease: ANIMATION.shake.transition.ease,
        scale: SHAKE_WRAPPER_TOKENS.motion.hoverTransition,
      });
      // Idle state keeps the shake target at rest.
      expect(motionProps?.["animate"]).toEqual({ x: 0 });
    });
  });
});
