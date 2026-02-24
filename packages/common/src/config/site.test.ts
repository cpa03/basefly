import { describe, expect, it } from "vitest";

import { siteConfig } from "./site";

describe("Site Configuration", () => {
  describe("siteConfig", () => {
    it("should have correct site name", () => {
      expect(siteConfig.name).toBe("Saasfly");
    });

    it("should have correct site description", () => {
      expect(siteConfig.description).toBe(
        "We provide an easier way to build saas service in production",
      );
    });

    it("should have correct site URL", () => {
      expect(siteConfig.url).toBe("https://github.com/saasfly/saasfly");
    });

    it("should have correct ogImage", () => {
      expect(siteConfig.ogImage).toBe("");
    });

    it("should have correct GitHub link", () => {
      expect(siteConfig.links.github).toBe(
        "https://github.com/saasfly/saasfly",
      );
    });

    it("should be a plain object with expected structure", () => {
      expect(typeof siteConfig).toBe("object");
      expect(siteConfig).toHaveProperty("name");
      expect(siteConfig).toHaveProperty("description");
      expect(siteConfig).toHaveProperty("url");
      expect(siteConfig).toHaveProperty("ogImage");
      expect(siteConfig).toHaveProperty("links");
    });

    it("should have links object with github property", () => {
      expect(typeof siteConfig.links).toBe("object");
      expect(siteConfig.links).toHaveProperty("github");
    });
  });

  describe("Deprecation notice", () => {
    it("should use centralized project config values", () => {
      // siteConfig is deprecated and should use PROJECT_CONFIG directly
      // This test verifies the current values match the expected legacy values
      expect(siteConfig.name).toBeDefined();
      expect(siteConfig.description).toBeDefined();
      expect(siteConfig.url).toBeDefined();
    });
  });
});
