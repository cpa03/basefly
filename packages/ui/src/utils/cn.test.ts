import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles single class name", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("handles conditional class names", () => {
    expect(cn("px-4", true && "py-2", false && "bg-red-500")).toBe("px-4 py-2");
  });

  it("handles null and undefined values", () => {
    expect(cn("px-4", null, "py-2", undefined)).toBe("px-4 py-2");
  });

  it("removes conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("removes conflicting Tailwind classes for different properties", () => {
    expect(cn("px-4 py-2", "px-2 py-1")).toBe("px-2 py-1");
  });

  it("handles array of class names", () => {
    expect(cn(["px-4", "py-2"])).toBe("px-4 py-2");
  });

  it("handles object with boolean values", () => {
    expect(cn({ "px-4": true, "py-2": true, "bg-red-500": false })).toBe(
      "px-4 py-2",
    );
  });

  it("handles complex mixed inputs", () => {
    expect(
      cn(
        "px-4",
        ["py-2", { "bg-red-500": false, "text-white": true }],
        null,
        undefined,
        "rounded",
      ),
    ).toBe("px-4 py-2 text-white rounded");
  });

  it("handles duplicate classes", () => {
    expect(cn("px-4", "px-4")).toBe("px-4");
  });

  it("handles utility class conflicts correctly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles margin class conflicts", () => {
    expect(cn("m-4", "m-2")).toBe("m-2");
  });

  it("handles color class conflicts", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles spacing conflicts for different directions", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
});
