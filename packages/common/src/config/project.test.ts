import { describe, it, expect } from "vitest";
import {
  BRAND_CONFIG,
  COMPANY_CONFIG,
  REPOSITORY_CONFIG,
  APP_URLS,
  FEATURE_CONFIG,
  DEPLOYMENT_CONFIG,
  CLI_CONFIG,
  MARKETING_CONFIG,
  INTEGRATION_CONFIG,
  PROJECT_CONFIG,
  getCurrentBaseUrl,
  isProjectFeatureEnabled,
  getBrandName,
  getRepositoryUrl,
} from "./project";

describe("project", () => {
  describe("BRAND_CONFIG", () => {
    it("should have brand name and description", () => {
      expect(BRAND_CONFIG.name).toBe("Basefly");
      expect(BRAND_CONFIG.legacyName).toBe("Saasfly");
      expect(BRAND_CONFIG.description).toContain("Kubernetes");
    });

    it("should have brand colors", () => {
      expect(BRAND_CONFIG.colors.primary).toBe("#3b82f6");
      expect(BRAND_CONFIG.colors.secondary).toBe("#8b5cf6");
      expect(BRAND_CONFIG.colors.accent).toBe("#FF782B");
    });

    it("should have brand assets", () => {
      expect(BRAND_CONFIG.assets.logo).toBe("/saasfly-logo.svg");
      expect(BRAND_CONFIG.assets.favicon).toBe("/favicon.ico");
    });

    it("should have keywords", () => {
      expect(BRAND_CONFIG.keywords).toContain("kubernetes");
      expect(BRAND_CONFIG.keywords).toContain("k8s");
    });
  });

  describe("COMPANY_CONFIG", () => {
    it("should have company information", () => {
      expect(COMPANY_CONFIG.name).toBe("Nextify");
      expect(COMPANY_CONFIG.legalName).toBe("Nextify Limited");
      expect(COMPANY_CONFIG.website).toBe("https://nextify.ltd");
    });

    it("should have contact emails", () => {
      expect(COMPANY_CONFIG.email).toBe("contact@nextify.ltd");
      expect(COMPANY_CONFIG.supportEmail).toBe("support@saasfly.io");
    });

    it("should have social media handles", () => {
      expect(COMPANY_CONFIG.social.twitter.handle).toBe("@nextify2024");
      expect(COMPANY_CONFIG.social.github.org).toBe("basefly");
      expect(COMPANY_CONFIG.social.discord.invite).toContain("discord");
    });
  });

  describe("REPOSITORY_CONFIG", () => {
    it("should have repository information", () => {
      expect(REPOSITORY_CONFIG.owner).toBe("basefly");
      expect(REPOSITORY_CONFIG.name).toBe("basefly");
    });

    it("should generate correct URLs", () => {
      expect(REPOSITORY_CONFIG.url).toBe("https://github.com/basefly/basefly");
      expect(REPOSITORY_CONFIG.legacyUrl).toBe(
        "https://github.com/saasfly/saasfly"
      );
    });

    it("should have contributor count", () => {
      expect(REPOSITORY_CONFIG.contributorCount).toBe(9);
    });
  });

  describe("APP_URLS", () => {
    it("should have application URLs", () => {
      expect(APP_URLS.production).toBe("https://saasfly.io");
      expect(APP_URLS.demo).toBe("https://show.saasfly.io");
      expect(APP_URLS.development).toBe("http://localhost:3000");
    });

    it("should have alternative ports", () => {
      expect(APP_URLS.altPorts.port3001).toBe("http://localhost:3001");
    });
  });

  describe("FEATURE_CONFIG", () => {
    it("should have billing features", () => {
      expect(FEATURE_CONFIG.billing.enabled).toBe(true);
      expect(FEATURE_CONFIG.billing.stripeIntegration).toBe(true);
    });

    it("should have cluster features", () => {
      expect(FEATURE_CONFIG.clusters.enabled).toBe(true);
      expect(FEATURE_CONFIG.clusters.autoProvisioning).toBe(false);
    });

    it("should have auth features", () => {
      expect(FEATURE_CONFIG.auth.clerk).toBe(true);
      expect(FEATURE_CONFIG.auth.googleOAuth).toBe(false);
    });
  });

  describe("DEPLOYMENT_CONFIG", () => {
    it("should have deployment platform", () => {
      expect(DEPLOYMENT_CONFIG.platform).toBe("vercel");
    });

    it("should have required env vars", () => {
      expect(DEPLOYMENT_CONFIG.requiredEnvVars).toContain("POSTGRES_URL");
      expect(DEPLOYMENT_CONFIG.requiredEnvVars).toContain("CLERK_SECRET_KEY");
    });
  });

  describe("CLI_CONFIG", () => {
    it("should have primary installation command", () => {
      expect(CLI_CONFIG.primary).toBe("bun create saasfly");
    });

    it("should have alternative package managers", () => {
      expect(CLI_CONFIG.alternatives.pnpm).toContain("pnpm");
      expect(CLI_CONFIG.alternatives.git).toContain("github.com");
    });
  });

  describe("MARKETING_CONFIG", () => {
    it("should have SEO defaults", () => {
      expect(MARKETING_CONFIG.seo.titleTemplate).toContain("%s");
      expect(MARKETING_CONFIG.seo.defaultTitle).toContain("Basefly");
    });

    it("should have CTA buttons", () => {
      expect(MARKETING_CONFIG.cta.primary).toBe("Get Started");
      expect(MARKETING_CONFIG.cta.secondary).toBe("View Demo");
    });
  });

  describe("INTEGRATION_CONFIG", () => {
    it("should have auth integration", () => {
      expect(INTEGRATION_CONFIG.auth.provider).toBe("clerk");
    });

    it("should have payment integration", () => {
      expect(INTEGRATION_CONFIG.payment.provider).toBe("stripe");
    });

    it("should have database integration", () => {
      expect(INTEGRATION_CONFIG.database.provider).toBe("postgresql");
      expect(INTEGRATION_CONFIG.database.orm).toBe("prisma");
    });
  });

  describe("PROJECT_CONFIG", () => {
    it("should combine all configurations", () => {
      expect(PROJECT_CONFIG.brand).toBe(BRAND_CONFIG);
      expect(PROJECT_CONFIG.company).toBe(COMPANY_CONFIG);
      expect(PROJECT_CONFIG.repository).toBe(REPOSITORY_CONFIG);
    });
  });

  describe("getCurrentBaseUrl", () => {
    it("should return env URL when provided", () => {
      expect(getCurrentBaseUrl("https://custom.com")).toBe("https://custom.com");
    });

    it("should return development URL in development mode", () => {
      expect(getCurrentBaseUrl(undefined, "development")).toBe(
        "http://localhost:3000"
      );
    });

    it("should return production URL by default", () => {
      expect(getCurrentBaseUrl(undefined, "production")).toBe(
        "https://saasfly.io"
      );
    });
  });

  describe("isProjectFeatureEnabled", () => {
    it("should check nested feature flags", () => {
      expect(isProjectFeatureEnabled("billing.enabled")).toBe(true);
      expect(isProjectFeatureEnabled("billing.stripeIntegration")).toBe(true);
      expect(isProjectFeatureEnabled("clusters.enabled")).toBe(true);
    });

    it("should return false for non-existent features", () => {
      expect(isProjectFeatureEnabled("nonexistent.feature")).toBe(false);
      expect(isProjectFeatureEnabled("billing.nonexistent")).toBe(false);
    });
  });

  describe("getBrandName", () => {
    it("should return current brand name by default", () => {
      expect(getBrandName()).toBe("Basefly");
    });

    it("should return legacy brand name when requested", () => {
      expect(getBrandName(true)).toBe("Saasfly");
    });
  });

  describe("getRepositoryUrl", () => {
    it("should return current repository URL by default", () => {
      expect(getRepositoryUrl()).toBe("https://github.com/basefly/basefly");
    });

    it("should return legacy URL when requested", () => {
      expect(getRepositoryUrl(true)).toBe("https://github.com/saasfly/saasfly");
    });
  });
});
