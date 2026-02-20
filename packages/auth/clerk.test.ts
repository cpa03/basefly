import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionUser, isClerkEnabled } from "./clerk";

vi.mock("./env.mjs", () => ({
  env: {
    ADMIN_EMAIL: "admin@example.com,superadmin@example.com",
  },
}));

interface MockAuthResponse {
  sessionClaims?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  };
}

const mockAuth = vi.fn<() => Promise<MockAuthResponse>>();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

describe("Auth Clerk Module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockAuth.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("isClerkEnabled", () => {
    it("should return false when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set", () => {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when key is empty string", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when key contains 'dummy'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_dummy_key_123456789012345678";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when key contains 'placeholder'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_placeholder_key_12345678901234";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when key does not start with 'pk_'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "sk_test_12345678901234567890123";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return false when key is too short (<= 20 chars)", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_short";
      expect(isClerkEnabled()).toBe(false);
    });

    it("should return true when key is valid format", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      expect(isClerkEnabled()).toBe(true);
    });

    it("should return true for production key format", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_live_12345678901234567890123";
      expect(isClerkEnabled()).toBe(true);
    });

    it("should handle whitespace in key gracefully", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "  pk_test_12345678901234567890123  ";
      expect(isClerkEnabled()).toBe(false);
    });
  });

  describe("getSessionUser", () => {
    it("should return null when Clerk is not enabled", async () => {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it("should return null when auth() throws an error", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      mockAuth.mockRejectedValue(new Error("Auth failed"));
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it("should return undefined when no session claims", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      mockAuth.mockResolvedValue({ sessionClaims: undefined });
      const user = await getSessionUser();
      expect(user).toBeUndefined();
    });

    it("should return undefined when sessionClaims has no user", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      mockAuth.mockResolvedValue({ sessionClaims: {} });
      const user = await getSessionUser();
      expect(user).toBeUndefined();
    });

    it("should return user when session is valid", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.png",
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user).toEqual({
        ...mockUser,
        isAdmin: false,
      });
    });

    it("should set isAdmin to true when user email is in ADMIN_EMAIL list", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_123",
        name: "Admin User",
        email: "admin@example.com",
        image: "https://example.com/admin.png",
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user?.isAdmin).toBe(true);
    });

    it("should set isAdmin to true for second admin in list", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_456",
        name: "Super Admin",
        email: "superadmin@example.com",
        image: "https://example.com/superadmin.png",
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user?.isAdmin).toBe(true);
    });

    it("should set isAdmin to false when user email is not in ADMIN_EMAIL list", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_789",
        name: "Regular User",
        email: "regular@example.com",
        image: "https://example.com/regular.png",
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user?.isAdmin).toBe(false);
    });

    it("should not set isAdmin when user has no email", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_noemail",
        name: "No Email User",
        email: null,
        image: null,
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user?.isAdmin).toBeUndefined();
    });

    it("should handle user with optional fields as null", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_minimal",
        name: null,
        email: null,
        image: null,
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user).toEqual({
        id: "user_minimal",
        name: null,
        email: null,
        image: null,
      });
    });

    it("should handle user with undefined optional fields", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_12345678901234567890123";
      const mockUser = {
        id: "user_undefined",
      };
      mockAuth.mockResolvedValue({
        sessionClaims: { user: mockUser },
      });
      const user = await getSessionUser();
      expect(user).toEqual({
        id: "user_undefined",
      });
    });
  });
});
