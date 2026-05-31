import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useMediaQuery from "./use-media-query";

describe("useMediaQuery", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // Mock matchMedia for desktop by default
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query.includes("max-width: 640px")) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      if (
        query.includes("min-width: 641px") &&
        query.includes("max-width: 1024px")
      ) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    // Mock window.innerWidth and innerHeight
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 768,
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("should return desktop device type by default", () => {
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.device).toBe("desktop");
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it("should return width and height dimensions", () => {
    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it("should return mobile when max-width is 640px", () => {
    // Re-mock for mobile
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query.includes("max-width: 640px")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 480,
    });

    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.device).toBe("mobile");
    expect(result.current.isMobile).toBe(true);
  });

  it("should return tablet when width is between 641px and 1024px", () => {
    // Re-mock for tablet
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query.includes("max-width: 640px")) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      if (
        query.includes("min-width: 641px") &&
        query.includes("max-width: 1024px")
      ) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 800,
    });

    const { result } = renderHook(() => useMediaQuery());
    expect(result.current.device).toBe("tablet");
    expect(result.current.isTablet).toBe(true);
  });
});
