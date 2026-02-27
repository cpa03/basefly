import { describe, it, expect } from "vitest";
import {
  ASSET_BASE_PATHS,
  ASSETS,
  getAssetPath,
} from "./assets";

describe("assets", () => {
  describe("ASSET_BASE_PATHS", () => {
    it("should have correct base paths", () => {
      expect(ASSET_BASE_PATHS.images).toBe("/images");
      expect(ASSET_BASE_PATHS.avatars).toBe("/images/avatars");
      expect(ASSET_BASE_PATHS.sponsors).toBe("/images");
    });
  });

  describe("ASSETS", () => {
    it("should have logo asset path", () => {
      expect(ASSETS.logo).toBe("/images/avatars/saasfly-logo.svg");
    });

    it("should have Clerk logo path", () => {
      expect(ASSETS.clerkLogo).toContain("clerk.png");
    });
  });

  describe("getAssetPath", () => {
    it("should return path without base URL", () => {
      expect(getAssetPath("/images/logo.png")).toBe("/images/logo.png");
    });

    it("should prepend base URL when provided", () => {
      expect(getAssetPath("/images/logo.png", "https://cdn.example.com")).toBe(
        "https://cdn.example.com/images/logo.png"
      );
    });

    it("should handle empty path", () => {
      expect(getAssetPath("", "https://cdn.example.com")).toBe(
        "https://cdn.example.com"
      );
    });
  });
});
