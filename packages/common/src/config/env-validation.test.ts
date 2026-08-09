import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RECOMMENDED_ENV_VARS,
  REQUIRED_ENV_VARS,
  getEnvValidationMessage,
  initEnvValidation,
  validateEnvVars,
} from "./env";

vi.mock("../logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
  },
}));

import { logger } from "../logger";

const mockedWarn = vi.mocked(logger.warn);

function setRequiredEnv(missing: string[] = []): void {
  for (const varName of REQUIRED_ENV_VARS) {
    if (missing.includes(varName)) {
      vi.stubEnv(varName, "");
    } else {
      vi.stubEnv(varName, "test-value");
    }
  }
}

function setRecommendedEnv(missing: string[] = []): void {
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (missing.includes(varName)) {
      vi.stubEnv(varName, "");
    } else {
      vi.stubEnv(varName, "test-value");
    }
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("env validation", () => {
  describe("validateEnvVars", () => {
    it("returns valid=true when all required env vars are set", () => {
      setRequiredEnv();
      setRecommendedEnv();

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.missingRecommended).toHaveLength(0);
    });

    it("lists missing required vars and marks result invalid", () => {
      setRequiredEnv();
      setRecommendedEnv();
      vi.stubEnv("CLERK_SECRET_KEY", "");
      vi.stubEnv("POSTGRES_URL", "");

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain("CLERK_SECRET_KEY");
      expect(result.missing).toContain("POSTGRES_URL");
    });

    it("treats whitespace-only values as missing", () => {
      setRequiredEnv();
      setRecommendedEnv();
      vi.stubEnv("NEXT_PUBLIC_APP_URL", "   ");

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain("NEXT_PUBLIC_APP_URL");
    });

    it("reports missing recommended vars without failing validation", () => {
      setRequiredEnv();
      setRecommendedEnv(["STRIPE_API_KEY", "REDIS_URL"]);

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.missingRecommended).toContain("STRIPE_API_KEY");
      expect(result.missingRecommended).toContain("REDIS_URL");
    });
  });

  describe("getEnvValidationMessage", () => {
    it("returns success message when all required vars are set", () => {
      setRequiredEnv();
      setRecommendedEnv();

      const message = getEnvValidationMessage();

      expect(message).toBe(
        "All required environment variables are configured.",
      );
    });

    it("includes missing required variable names", () => {
      setRequiredEnv();
      setRecommendedEnv();
      vi.stubEnv("CLERK_SECRET_KEY", "");

      const message = getEnvValidationMessage();

      expect(message).toContain(
        "Missing required environment variables: CLERK_SECRET_KEY",
      );
    });

    it("returns success message when only recommended vars are missing", () => {
      setRequiredEnv();
      setRecommendedEnv(["ADMIN_EMAIL"]);

      const message = getEnvValidationMessage();

      expect(message).toBe(
        "All required environment variables are configured.",
      );
    });

    it("includes recommended variable names when required vars are also missing", () => {
      setRequiredEnv(["POSTGRES_URL"]);
      setRecommendedEnv(["ADMIN_EMAIL"]);

      const message = getEnvValidationMessage();

      expect(message).toContain(
        "Missing required environment variables: POSTGRES_URL",
      );
      expect(message).toContain(
        "Missing recommended environment variables: ADMIN_EMAIL",
      );
    });
  });

  describe("initEnvValidation", () => {
    it("logs a warning instead of throwing in non-production when required vars are missing", () => {
      setRequiredEnv(["CLERK_SECRET_KEY"]);
      setRecommendedEnv();

      expect(() => initEnvValidation()).not.toThrow();
      expect(mockedWarn).toHaveBeenCalledWith(
        expect.stringContaining("CLERK_SECRET_KEY"),
      );
    });

    it("logs a warning when recommended vars are missing", () => {
      setRequiredEnv();
      setRecommendedEnv(["STRIPE_API_KEY"]);

      expect(() => initEnvValidation()).not.toThrow();
      expect(mockedWarn).toHaveBeenCalledWith(
        expect.stringContaining("STRIPE_API_KEY"),
      );
    });

    it("does not warn when all required and recommended vars are set", () => {
      setRequiredEnv();
      setRecommendedEnv();

      expect(() => initEnvValidation()).not.toThrow();
      expect(mockedWarn).not.toHaveBeenCalled();
    });

    it("throws in production when required env vars are missing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();

      const prodEnv = await import("./env");

      // Simulate missing required vars in the production process
      for (const varName of REQUIRED_ENV_VARS) {
        vi.stubEnv(varName, "");
      }

      expect(() => prodEnv.initEnvValidation()).toThrow(
        /Environment validation failed:/,
      );
    });

    it("does not throw in production when all required env vars are set", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();

      const prodEnv = await import("./env");

      for (const varName of REQUIRED_ENV_VARS) {
        vi.stubEnv(varName, "test-value");
      }

      expect(() => prodEnv.initEnvValidation()).not.toThrow();
    });
  });
});
