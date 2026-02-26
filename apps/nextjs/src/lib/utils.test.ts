import { describe, expect, it, beforeEach, vi } from "vitest";
import { formatDate, absoluteUrl } from "./utils";

describe("formatDate", () => {
  it("should format valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("January 15, 2024");
  });

  it("should format valid Date object", () => {
    const result = formatDate(new Date("2024-06-20"));
    expect(result).toBe("June 20, 2024");
  });

  it("should format numeric timestamp", () => {
    const result = formatDate(1704067200000);
    expect(result).toBe("January 1, 2024");
  });

  it("should return dash for undefined", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("should return dash for null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("should return dash for empty string", () => {
    expect(formatDate("")).toBe("-");
  });

  it("should return dash for invalid date string", () => {
    expect(formatDate("invalid-date")).toBe("-");
  });
});

describe("absoluteUrl", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should construct URL with NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const result = absoluteUrl("/dashboard");
    expect(result).toBe("https://example.com/dashboard");
    vi.unstubAllEnvs();
  });

  it("should handle path without leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const result = absoluteUrl("dashboard");
    expect(result).toBe("https://example.com/dashboard");
    vi.unstubAllEnvs();
  });

  it("should use localhost as fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    const result = absoluteUrl("/api");
    expect(result).toBe("http://localhost:3000/api");
    vi.unstubAllEnvs();
  });

  it("should handle empty path", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com");
    const result = absoluteUrl("");
    expect(result).toBe("https://example.com/");
    vi.unstubAllEnvs();
  });
});
