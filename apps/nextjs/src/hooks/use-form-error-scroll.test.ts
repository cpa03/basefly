import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANIMATION, SCROLL_DELAYS } from "@saasfly/common";

import { useFormErrorScroll } from "./use-form-error-scroll";

describe("useFormErrorScroll", () => {
  let focusSpy: ReturnType<typeof vi.fn>;
  let originalMatchMedia: typeof window.matchMedia;
  let originalScrollTo: typeof window.scrollTo;

  beforeEach(() => {
    vi.useFakeTimers();

    originalMatchMedia = window.matchMedia;
    originalScrollTo = window.scrollTo;

    // No reduced-motion preference by default (so the animation delay path is used)
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    window.scrollTo = vi.fn();

    focusSpy = vi.fn();
    // Spy on HTMLElement.prototype.focus to observe the focus call
    vi.spyOn(HTMLElement.prototype, "focus").mockImplementation(function (
      this: HTMLElement,
      options?: FocusOptions,
    ) {
      focusSpy(options);
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.scrollTo = originalScrollTo;
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("should scroll to the first error field", () => {
    document.body.innerHTML = '<input name="email" />';

    const { result } = renderHook(() => useFormErrorScroll());
    const scrollToError = result.current;

    act(() => {
      scrollToError({ email: "Email is required" });
    });

    // Advance past the outer DOM-update delay
    act(() => {
      vi.advanceTimersByTime(SCROLL_DELAYS.formError);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });

  it("should wait for the scroll animation to complete before focusing the error element", () => {
    document.body.innerHTML = '<input name="email" />';

    const { result } = renderHook(() => useFormErrorScroll());
    const scrollToError = result.current;

    act(() => {
      scrollToError({ email: "Email is required" });
    });

    // Advance past the outer DOM-update delay
    act(() => {
      vi.advanceTimersByTime(SCROLL_DELAYS.formError);
    });

    // The focus must NOT fire until the animation duration (ANIMATION.ms.normal)
    // has elapsed. The old implementation used
    // `parseInt(ANIMATION.duration.normal)` where `duration.normal` is the
    // Tailwind class string "duration-200" -> parseInt returns NaN -> the
    // timeout fires immediately (0ms), focusing the element too early.
    act(() => {
      vi.advanceTimersByTime(ANIMATION.ms.normal / 2);
    });

    expect(focusSpy).not.toHaveBeenCalled();

    // After the full animation duration the element is focused
    act(() => {
      vi.advanceTimersByTime(ANIMATION.ms.normal / 2);
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("should focus immediately when reduced motion is preferred", () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    document.body.innerHTML = '<input name="email" />';

    const { result } = renderHook(() => useFormErrorScroll());
    const scrollToError = result.current;

    act(() => {
      scrollToError({ email: "Email is required" });
    });

    // Advance past the outer DOM-update delay, plus one tick so the inner
    // zero-delay timeout (scheduled at the timer boundary) is processed
    act(() => {
      vi.advanceTimersByTime(SCROLL_DELAYS.formError + 1);
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("should do nothing when there are no errors", () => {
    const { result } = renderHook(() => useFormErrorScroll());
    const scrollToError = result.current;

    act(() => {
      scrollToError({});
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(focusSpy).not.toHaveBeenCalled();
  });
});
