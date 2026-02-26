import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 500 });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
    vi.useRealTimers();
  });

  it("should reset timer on value change", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 500 } }
    );

    rerender({ value: "second", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("first");

    rerender({ value: "third", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("third");
    vi.useRealTimers();
  });

  it("should handle different delay values", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 1000 } }
    );

    rerender({ value: "updated", delay: 1000 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe("updated");
    vi.useRealTimers();
  });
});
