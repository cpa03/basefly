// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionUser, isClerkEnabled } from "./clerk";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("./env.mjs", () => ({
  env: {
    ADMIN_EMAIL: "admin@example.com,superadmin@example.com",
  },
}));

vi.mock("./logger", () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Auth Package Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isClerkEnabled", () => {
    it("returns true for valid Clerk publishable key", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      expect(isClerkEnabled()).toBe(true);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for undefined Clerk key", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for empty Clerk key", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "";

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for Clerk key containing 'dummy'", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_dummy_key1234567890123";

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for Clerk key containing 'placeholder'", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_placeholder_key123456789";

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for Clerk key not starting with 'pk_'", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "sk_test_validkey123456789";

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns false for Clerk key shorter than 20 characters", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_short";

      expect(isClerkEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns true for production Clerk key", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_live_validkey1234567890123";

      expect(isClerkEnabled()).toBe(true);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });
  });

  describe("getSessionUser", () => {
    it("returns null when Clerk is not enabled", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

      const result = await getSessionUser();
      expect(result).toBeNull();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns user from session claims when Clerk is enabled", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.png",
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result).toMatchObject({
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
      });

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("sets isAdmin to true for admin users", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_123",
        name: "Admin User",
        email: "admin@example.com",
        image: null,
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result?.isAdmin).toBe(true);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("sets isAdmin to false for non-admin users", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_456",
        name: "Regular User",
        email: "regular@example.com",
        image: null,
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result?.isAdmin).toBe(false);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns undefined when session claims are undefined", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: undefined,
      });

      const result = await getSessionUser();
      expect(result).toBeUndefined();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("returns undefined when user is undefined in session claims", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {},
      });

      const result = await getSessionUser();
      expect(result).toBeUndefined();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("handles Clerk auth errors gracefully", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Clerk auth failed"),
      );

      const result = await getSessionUser();
      expect(result).toBeNull();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("handles user with null email", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_789",
        name: "No Email User",
        email: null,
        image: null,
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result).toMatchObject({
        id: "user_789",
        name: "No Email User",
      });
      expect(result?.isAdmin).toBeUndefined();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("handles user with undefined email", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_101",
        name: "Undefined Email User",
        email: undefined,
        image: null,
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result).toMatchObject({
        id: "user_101",
        name: "Undefined Email User",
      });
      expect(result?.isAdmin).toBeUndefined();

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });

    it("handles superadmin email", async () => {
      const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_validkey123456789";

      const mockUser = {
        id: "user_super",
        name: "Super Admin",
        email: "superadmin@example.com",
        image: null,
      };

      const { auth } = await import("@clerk/nextjs/server");
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        sessionClaims: {
          user: { ...mockUser },
        },
      });

      const result = await getSessionUser();
      expect(result?.isAdmin).toBe(true);

      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;
    });
  });
});
