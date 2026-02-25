import { describe, expect, it } from "vitest";

import {
  BRAND,
  CLI_COMMANDS,
  CONTACT,
  DEV_URLS,
  EXTERNAL_URLS,
  getAvatarUrl,
  getBaseUrl,
  getExternalUrl,
  getGitHubProfileUrl,
  getRoute,
  getTwitterProfileUrl,
  GITHUB_REPO,
  ROUTES,
} from "./urls";

describe("URLs Configuration", () => {
  describe("EXTERNAL_URLS", () => {
    it("should have libra URL", () => {
      expect(EXTERNAL_URLS.libra.home).toBe("https://libra.dev/");
    });

    it("should have docs URL", () => {
      expect(EXTERNAL_URLS.docs.home).toBe("https://docs.saasfly.io");
    });

    it("should have demo URL", () => {
      expect(EXTERNAL_URLS.demo.home).toBe("https://show.saasfly.io");
    });

    it("should have discord invite URL", () => {
      expect(EXTERNAL_URLS.discord.invite).toBe(
        "https://discord.gg/8SwSX43wnD",
      );
    });

    it("should have vercel deploy URL", () => {
      expect(EXTERNAL_URLS.vercel.deploy).toBe(
        "https://github.com/basefly/basefly",
      );
    });

    it("should have clerk referral URL", () => {
      expect(EXTERNAL_URLS.clerk.referral).toBe("https://go.clerk.com/uKDp7Au");
    });

    it("should have avatar function that generates correct URL", () => {
      expect(EXTERNAL_URLS.avatar.vercel("testuser")).toBe(
        "https://avatar.vercel.sh/testuser",
      );
    });

    it("should have github URLs", () => {
      expect(EXTERNAL_URLS.github.org).toBe(
        "https://github.com/basefly/basefly",
      );
      expect(EXTERNAL_URLS.github.repo).toBe(
        "https://github.com/basefly/basefly",
      );
    });
  });

  describe("ROUTES", () => {
    it("should have marketing routes", () => {
      expect(ROUTES.marketing.home).toBe("/");
      expect(ROUTES.marketing.pricing).toBe("/pricing");
      expect(ROUTES.marketing.blog).toBe("/blog");
      expect(ROUTES.marketing.docs).toBe("/docs");
    });

    it("should have dashboard routes", () => {
      expect(ROUTES.dashboard.home).toBe("/dashboard/");
      expect(ROUTES.dashboard.billing).toBe("/dashboard/billing");
      expect(ROUTES.dashboard.settings).toBe("/dashboard/settings");
    });

    it("should have docs routes", () => {
      expect(ROUTES.docs.home).toBe("/docs");
      expect(ROUTES.docs.documentation).toBe("/docs/documentation");
      expect(ROUTES.docs.components).toBe("/docs/documentation/components");
    });

    it("should have admin routes", () => {
      expect(ROUTES.admin.dashboard).toBe("/admin/dashboard");
    });

    it("should have API routes", () => {
      expect(ROUTES.api.webhooks.stripe).toBe("/api/webhooks/stripe");
      expect(ROUTES.api.trpc.edge).toBe("/api/trpc/edge");
    });
  });

  describe("CONTACT", () => {
    it("should have support contact", () => {
      expect(CONTACT.support.email).toBe("support@saasfly.io");
      expect(CONTACT.support.subject).toBe("Support Request");
    });

    it("should have business contact", () => {
      expect(CONTACT.business.email).toBe("contact@nextify.ltd");
    });
  });

  describe("GITHUB_REPO", () => {
    it("should have correct GitHub repo info", () => {
      expect(GITHUB_REPO.owner).toBe("basefly");
      expect(GITHUB_REPO.repo).toBe("basefly");
      expect(GITHUB_REPO.stars).toBe("2.5K");
    });
  });

  describe("BRAND", () => {
    it("should have brand name", () => {
      expect(BRAND.name).toBe("Saasfly");
    });

    it("should have brand description", () => {
      expect(BRAND.description).toBe(
        "We provide an easier way to build saas service in production",
      );
    });

    it("should have brand tagline", () => {
      expect(BRAND.tagline).toBe(
        "Enterprise-grade Kubernetes cluster management platform",
      );
    });
  });

  describe("DEV_URLS", () => {
    it("should have localhost URL", () => {
      expect(DEV_URLS.localhost).toBe("http://localhost:3000");
    });

    it("should have local WebSocket URL", () => {
      expect(DEV_URLS.localWs).toBe("ws://localhost:12882/");
    });

    it("should have alt ports", () => {
      expect(DEV_URLS.altPorts.port3001).toBe("http://localhost:3001");
      expect(DEV_URLS.altPorts.port3002).toBe("http://localhost:3002");
    });
  });

  describe("getExternalUrl", () => {
    it("should return external URL by key", () => {
      expect(getExternalUrl("libra")).toEqual({ home: "https://libra.dev/" });
      expect(getExternalUrl("discord")).toEqual({
        invite: "https://discord.gg/8SwSX43wnD",
      });
    });
  });

  describe("getRoute", () => {
    it("should return route by section and path", () => {
      expect(getRoute("marketing", "home")).toBe("/");
      expect(getRoute("marketing", "pricing")).toBe("/pricing");
      expect(getRoute("dashboard", "billing")).toBe("/dashboard/billing");
      expect(getRoute("docs", "home")).toBe("/docs");
    });
  });

  describe("getAvatarUrl", () => {
    it("should generate Vercel avatar URL", () => {
      expect(getAvatarUrl("john")).toBe("https://avatar.vercel.sh/john");
      expect(getAvatarUrl("jane-doe")).toBe(
        "https://avatar.vercel.sh/jane-doe",
      );
    });
  });

  describe("getGitHubProfileUrl", () => {
    it("should generate GitHub profile URL from username", () => {
      expect(getGitHubProfileUrl("12345")).toBe(
        "https://avatars.githubusercontent.com/u/12345",
      );
      expect(getGitHubProfileUrl("abc")).toBe(
        "https://avatars.githubusercontent.com/u/abc",
      );
    });
  });

  describe("getTwitterProfileUrl", () => {
    it("should generate Twitter/X profile URL", () => {
      expect(getTwitterProfileUrl("nextify2024")).toBe(
        "https://x.com/nextify2024",
      );
      expect(getTwitterProfileUrl("testuser")).toBe("https://x.com/testuser");
    });
  });

  describe("getBaseUrl", () => {
    it("should return envUrl if provided", () => {
      expect(getBaseUrl("https://custom.example.com")).toBe(
        "https://custom.example.com",
      );
    });

    it("should return localhost for development environment", () => {
      expect(getBaseUrl(undefined, "development")).toBe(
        "http://localhost:3000",
      );
    });

    it("should throw error when no URL is provided in production", () => {
      expect(() => getBaseUrl(undefined, "production")).toThrow(
        "Base URL is not defined",
      );
    });

    it("should throw error when no URL is provided and no nodeEnv", () => {
      expect(() => getBaseUrl()).toThrow("Base URL is not defined");
    });

    it("should prefer envUrl over nodeEnv", () => {
      expect(getBaseUrl("https://custom.example.com", "development")).toBe(
        "https://custom.example.com",
      );
    });
  });

  describe("CLI_COMMANDS", () => {
    it("should have primary command", () => {
      expect(CLI_COMMANDS.primary).toBe("bun create saasfly");
    });

    it("should have alternative commands", () => {
      expect(CLI_COMMANDS.alternatives.npm).toBe("npx create-saasfly");
      expect(CLI_COMMANDS.alternatives.pnpm).toBe("pnpm create saasfly");
      expect(CLI_COMMANDS.alternatives.yarn).toBe("yarn create saasfly");
    });
  });
});
