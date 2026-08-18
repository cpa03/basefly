import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useScroll from "./use-scroll";

describe("useScroll", () => {
  const originalPageYOffset = window.pageYOffset;
  const originalScrollY = window.scrollY;

  const setScrollY = (value: number) => {
    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      configurable: true,
      value,
    });
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value,
    });
  };

  beforeEach(() => {
    setScrollY(0);
  });

  afterEach(() => {
    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: originalPageYOffset,
    });
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: originalScrollY,
    });
  });

  it("should return false when not scrolled past the threshold", () => {
    setScrollY(10);
    const { result } = renderHook(() => useScroll(50));
    expect(result.current).toBe(false);
  });

  it("should reflect the initial scroll position on mount when already past the threshold", () => {
    // Page loads with the scroll position already beyond the threshold
    // (e.g. browser scroll restoration, anchor navigation). The hook must
    // evaluate the position on mount instead of waiting for a scroll event.
    setScrollY(200);
    const { result } = renderHook(() => useScroll(50));
    expect(result.current).toBe(true);
  });

  it("should update when the user scrolls past the threshold", () => {
    const { result } = renderHook(() => useScroll(50));

    act(() => {
      setScrollY(120);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(true);
  });

  it("should update when the user scrolls back above the threshold", () => {
    setScrollY(200);
    const { result } = renderHook(() => useScroll(50));

    act(() => {
      setScrollY(10);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toBe(false);
  });

  it("should clean up the scroll listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useScroll(50));

    expect(addSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
      expect.objectContaining({ passive: true }),
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
