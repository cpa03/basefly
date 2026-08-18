import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInputValidation } from "./use-form-ux";

describe("useInputValidation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const isNotEmpty = (value: string) => value.trim().length > 0;

  it("validates the last value on blur with default options", () => {
    const { result } = renderHook(() =>
      useInputValidation({ validate: isNotEmpty }),
    );

    act(() => {
      result.current.onChange("");
    });
    expect(result.current.isValid).toBe(true);

    act(() => {
      result.current.onBlur();
    });
    expect(result.current.isTouched).toBe(true);

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.isValid).toBe(false);
  });

  it("marks a valid value as valid on blur", () => {
    const { result } = renderHook(() =>
      useInputValidation({ validate: isNotEmpty }),
    );

    act(() => {
      result.current.onChange("hello");
    });
    act(() => {
      result.current.onBlur();
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isValid).toBe(true);
  });

  it("does not validate on blur when validateOnBlur is disabled", () => {
    const { result } = renderHook(() =>
      useInputValidation({ validate: isNotEmpty, validateOnBlur: false }),
    );

    act(() => {
      result.current.onChange("");
    });
    act(() => {
      result.current.onBlur();
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isValid).toBe(true);
  });

  it("validates on change once touched when validateOnChange is enabled", () => {
    const { result } = renderHook(() =>
      useInputValidation({
        validate: isNotEmpty,
        validateOnChange: true,
      }),
    );

    act(() => {
      result.current.onBlur();
    });
    act(() => {
      result.current.onChange("");
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isValid).toBe(false);
  });

  it("does not validate on change before the input is touched", () => {
    const { result } = renderHook(() =>
      useInputValidation({
        validate: isNotEmpty,
        validateOnChange: true,
      }),
    );

    act(() => {
      result.current.onChange("");
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isValid).toBe(true);
  });

  it("treats inputs as valid when no validate function is provided", () => {
    const { result } = renderHook(() => useInputValidation());

    act(() => {
      result.current.onChange("");
    });
    act(() => {
      result.current.onBlur();
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.isValid).toBe(true);
  });

  it("reset restores the initial state", () => {
    const { result } = renderHook(() =>
      useInputValidation({ validate: isNotEmpty }),
    );

    act(() => {
      result.current.onChange("");
    });
    act(() => {
      result.current.onBlur();
    });
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.isTouched).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isValid).toBe(true);
    expect(result.current.isTouched).toBe(false);
  });
});
