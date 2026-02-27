import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMounted } from "./use-mounted";

describe("useMounted", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // In happy-dom environment, useEffect runs synchronously
  // so the initial state is already true after render
  it("should return true after render (effects run synchronously in test env)", () => {
    const { result } = renderHook(() => useMounted());
    // In test environment with happy-dom, effects run synchronously
    expect(result.current).toBe(true);
  });

  it("should return true after mount", () => {
    const { result } = renderHook(() => useMounted());

    // Advance timers to trigger useEffect
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe(true);
  });

  it("should remain true after initial mount", () => {
    const { result } = renderHook(() => useMounted());

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe(true);

    // Re-render should not change value
    const { result: result2 } = renderHook(() => useMounted());
    act(() => {
      vi.runAllTimers();
    });
    expect(result2.current).toBe(true);
  });
});
