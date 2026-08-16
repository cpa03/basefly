import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mock data - vi.mock factories are hoisted above module imports,
// so referenced variables MUST be created with vi.hoisted.
const { enDictionary, zhDictionary, koDictionary, jaDictionary } = vi.hoisted(() => ({
  enDictionary: {
    common: { errors: { title: "Something went wrong!" } },
  },
  zhDictionary: {
    common: { errors: { title: "出了点问题" } },
  },
  koDictionary: {
    common: { errors: { title: "문제가 발생했습니다" } },
  },
  jaDictionary: {
    common: { errors: { title: "エラーが発生しました" } },
  },
}));

vi.mock("~/config/dictionaries/en.json", () => ({ default: enDictionary }));
vi.mock("~/config/dictionaries/zh.json", () => ({ default: zhDictionary }));
vi.mock("~/config/dictionaries/ko.json", () => ({ default: koDictionary }));
vi.mock("~/config/dictionaries/ja.json", () => ({ default: jaDictionary }));

// next/navigation is mocked in src/test/setup.ts (usePathname returns "/").
// Re-mock here so tests can control the pathname per test.
const usePathnameMock = vi.hoisted(() => vi.fn(() => "/"));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

// The hook keeps a module-level store, so the module must be re-imported
// per test to avoid cross-test state leakage.
let extractLocaleFromPathname: (pathname: string) => string;
let useClientDictionary: () => {
  dict: unknown;
  isLoading: boolean;
};

beforeEach(async () => {
  vi.resetModules();
  usePathnameMock.mockReturnValue("/");
  const mod = await import("./use-client-dictionary");
  extractLocaleFromPathname = mod.extractLocaleFromPathname;
  useClientDictionary = mod.useClientDictionary;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("extractLocaleFromPathname", () => {
  it("should extract a valid locale from the first path segment", () => {
    expect(extractLocaleFromPathname("/en/dashboard")).toBe("en");
    expect(extractLocaleFromPathname("/zh/dashboard")).toBe("zh");
    expect(extractLocaleFromPathname("/ko/clusters")).toBe("ko");
    expect(extractLocaleFromPathname("/ja/settings")).toBe("ja");
  });

  it("should fall back to 'en' for unknown first segments", () => {
    expect(extractLocaleFromPathname("/fr/dashboard")).toBe("en");
    expect(extractLocaleFromPathname("/de/")).toBe("en");
  });

  it("should fall back to 'en' for root or empty pathnames", () => {
    expect(extractLocaleFromPathname("/")).toBe("en");
    expect(extractLocaleFromPathname("")).toBe("en");
  });

  it("should fall back to 'en' when the first segment is not a locale", () => {
    expect(extractLocaleFromPathname("/dashboard")).toBe("en");
    expect(extractLocaleFromPathname("/api/trpc/edge")).toBe("en");
  });
});

describe("useClientDictionary", () => {
  it("should start with isLoading true and dict null (SSR-safe initial render)", async () => {
    const { result } = renderHook(() => useClientDictionary());

    // Server snapshot and initial client snapshot both return null,
    // so SSR HTML matches the client initial render (no hydration mismatch).
    expect(result.current.isLoading).toBe(true);
    expect(result.current.dict).toBeNull();

    // Let the pending dictionary import settle before the test ends so it
    // does not leak into subsequent tests (the store is module-level).
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should load the dictionary for the current locale after mount", async () => {
    usePathnameMock.mockReturnValue("/en/dashboard");
    const { result } = renderHook(() => useClientDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dict).toEqual(enDictionary);
  });

  it("should load the zh dictionary when pathname locale is zh", async () => {
    usePathnameMock.mockReturnValue("/zh/dashboard");
    const { result } = renderHook(() => useClientDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dict).toEqual(zhDictionary);
  });

  it("should fall back to the en dictionary when the locale import fails", async () => {
    // Override the ko mock to reject so the hook falls back to English.
    vi.doMock("~/config/dictionaries/ko.json", () => {
      throw new Error("boom");
    });
    vi.resetModules();
    const mod = await import("./use-client-dictionary");
    useClientDictionary = mod.useClientDictionary;

    usePathnameMock.mockReturnValue("/ko/dashboard");
    const { result } = renderHook(() => useClientDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dict).toEqual(enDictionary);
  });

  it("should reload the dictionary when the pathname locale changes", async () => {
    usePathnameMock.mockReturnValue("/en/dashboard");
    const { result, rerender } = renderHook(() => useClientDictionary());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.dict).toEqual(enDictionary);

    // Simulate a locale change navigation and re-render to trigger the effect.
    act(() => {
      usePathnameMock.mockReturnValue("/zh/dashboard");
    });
    rerender();

    await waitFor(() => {
      expect(result.current.dict).toEqual(zhDictionary);
    });
  });
});
