import { describe, it, expect } from "vitest";
import {
  CSP_DOMAINS,
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  buildCSPHeader,
  getMinifiedCSPHeader,
  CSP_CONFIG,
} from "./csp";

describe("csp", () => {
  describe("CSP_DOMAINS", () => {
    it("should have script domains", () => {
      expect(CSP_DOMAINS.scripts.cdn).toBe("cdn.jsdelivr.net");
      expect(CSP_DOMAINS.scripts.vercel).toContain("va.vercel-scripts.com");
    });

    it("should have image domains", () => {
      expect(CSP_DOMAINS.images.unsplash).toContain("unsplash.com");
      expect(CSP_DOMAINS.images.github).toContain("githubusercontent.com");
    });

    it("should have font domains", () => {
      expect(CSP_DOMAINS.fonts.cdn).toBe("cdn.jsdelivr.net");
    });

    it("should have connect domains", () => {
      expect(CSP_DOMAINS.connect.clerk).toContain("clerk.accounts.dev");
      expect(CSP_DOMAINS.connect.stripe).toContain("stripe.com");
    });

    it("should have frame domains", () => {
      expect(CSP_DOMAINS.frames.stripe).toBe("https://js.stripe.com");
    });
  });

  describe("CSP_DIRECTIVES", () => {
    it("should have default-src directive", () => {
      expect(CSP_DIRECTIVES.defaultSrc).toContain("'self'");
    });

    it("should have script-src directive", () => {
      expect(CSP_DIRECTIVES.scriptSrc).toContain("'self'");
      expect(CSP_DIRECTIVES.scriptSrc).toContain("'unsafe-inline'");
    });

    it("should have style-src directive", () => {
      expect(CSP_DIRECTIVES.styleSrc).toContain("'self'");
      expect(CSP_DIRECTIVES.styleSrc).toContain("'unsafe-inline'");
    });

    it("should have img-src directive", () => {
      expect(CSP_DIRECTIVES.imgSrc).toContain("'self'");
      expect(CSP_DIRECTIVES.imgSrc).toContain("blob:");
      expect(CSP_DIRECTIVES.imgSrc).toContain("data:");
    });

    it("should have font-src directive", () => {
      expect(CSP_DIRECTIVES.fontSrc).toContain("'self'");
      expect(CSP_DIRECTIVES.fontSrc).toContain("data:");
    });

    it("should have connect-src directive", () => {
      expect(CSP_DIRECTIVES.connectSrc).toContain("'self'");
    });

    it("should have frame-src directive", () => {
      expect(CSP_DIRECTIVES.frameSrc).toContain("'self'");
    });

    it("should have object-src set to none", () => {
      expect(CSP_DIRECTIVES.objectSrc).toContain("'none'");
    });
  });

  describe("SECURITY_HEADERS", () => {
    it("should have block-all-mixed-content", () => {
      expect(SECURITY_HEADERS.blockAllMixedContent).toBe(
        "block-all-mixed-content"
      );
    });

    it("should have upgrade-insecure-requests", () => {
      expect(SECURITY_HEADERS.upgradeInsecureRequests).toBe(
        "upgrade-insecure-requests"
      );
    });
  });

  describe("buildCSPHeader", () => {
    it("should build a CSP header string", () => {
      const header = buildCSPHeader();
      expect(header).toContain("default-src");
      expect(header).toContain("script-src");
      expect(header).toContain("style-src");
    });

    it("should include security headers", () => {
      const header = buildCSPHeader();
      expect(header).toContain("block-all-mixed-content");
      expect(header).toContain("upgrade-insecure-requests");
    });

    it("should separate directives with semicolons", () => {
      const header = buildCSPHeader();
      expect(header).toContain(";");
    });
  });

  describe("getMinifiedCSPHeader", () => {
    it("should return a minified CSP header", () => {
      const header = getMinifiedCSPHeader();
      expect(header).toBeTruthy();
      expect(header.length).toBeLessThanOrEqual(buildCSPHeader().length);
    });

    it("should contain all CSP directives", () => {
      const header = getMinifiedCSPHeader();
      expect(header).toContain("default-src");
      expect(header).toContain("script-src");
    });
  });

  describe("CSP_CONFIG", () => {
    it("should have domains", () => {
      expect(CSP_CONFIG.domains).toBe(CSP_DOMAINS);
    });

    it("should have directives", () => {
      expect(CSP_CONFIG.directives).toBe(CSP_DIRECTIVES);
    });

    it("should have buildHeader function", () => {
      expect(typeof CSP_CONFIG.buildHeader).toBe("function");
      expect(CSP_CONFIG.buildHeader()).toBe(buildCSPHeader());
    });

    it("should have getMinifiedHeader function", () => {
      expect(typeof CSP_CONFIG.getMinifiedHeader).toBe("function");
    });
  });
});
