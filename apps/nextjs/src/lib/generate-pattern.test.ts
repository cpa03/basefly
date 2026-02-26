import { describe, expect, it } from "vitest";
import { getRandomPatternStyle } from "./generate-pattern";

describe("generate-pattern", () => {
  it("should return object with backgroundImage property", () => {
    const result = getRandomPatternStyle("test-seed");
    expect(result).toHaveProperty("backgroundImage");
    expect(result.backgroundImage).toContain("url(");
  });

  it("should produce consistent results for same seed", () => {
    const result1 = getRandomPatternStyle("consistent-seed");
    const result2 = getRandomPatternStyle("consistent-seed");
    expect(result1.backgroundImage).toBe(result2.backgroundImage);
  });

  it("should produce different results for different seeds", () => {
    const result1 = getRandomPatternStyle("seed-one");
    const result2 = getRandomPatternStyle("seed-two");
    expect(result1.backgroundImage).not.toBe(result2.backgroundImage);
  });

  it("should handle empty string seed", () => {
    const result = getRandomPatternStyle("");
    expect(result).toHaveProperty("backgroundImage");
    expect(result.backgroundImage).toContain("url(");
  });

  it("should handle special characters in seed", () => {
    const result = getRandomPatternStyle("!@#$%^&*()");
    expect(result).toHaveProperty("backgroundImage");
    expect(result.backgroundImage).toContain("url(");
  });

  it("should handle unicode characters in seed", () => {
    const result = getRandomPatternStyle("你好世界");
    expect(result).toHaveProperty("backgroundImage");
    expect(result.backgroundImage).toContain("url(");
  });

  it("should handle very long seed", () => {
    const longSeed = "a".repeat(10000);
    const result = getRandomPatternStyle(longSeed);
    expect(result).toHaveProperty("backgroundImage");
    expect(result.backgroundImage).toContain("url(");
  });
});
