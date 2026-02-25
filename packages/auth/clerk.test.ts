import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionUser, isClerkEnabled } from "./clerk";

// Mock the clerk module
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock the common module
vi.mock("@saasfly/common", () => ({
  isAdminEmail: vi.fn((email: string) => email === "admin@example.com"),
}));

// Mock the logger
vi.mock("./logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("packages/auth/clerk", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isClerkEnabled", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    it("returns false when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set", () => {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      expect(isClerkEnabled()).toBe(false);
    });

    it("returns false when key contains 'dummy'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_dummy_key";
      expect(isClerkEnabled()).toBe(false);
    });

    it("returns false when key contains 'placeholder'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder_key";
      expect(isClerkEnabled()).toBe(false);
    });

    it("returns false when key does not start with 'pk_'", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "sk_test_key123";
      expect(isClerkEnabled()).toBe(false);
    });

    it("returns false when key is too short", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_123";
      expect(isClerkEnabled()).toBe(false);
    });

    it("returns true for valid Clerk publishable key", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      expect(isClerkEnabled()).toBe(true);
    });
  });

  describe("getSessionUser", () => {
    it("returns null when Clerk is not enabled", async () => {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      const result = await getSessionUser();
      expect(result).toBeNull();
    });

    it("returns null when auth() throws an error", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      (auth as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Auth error"),
      );

      const result = await getSessionUser();
      expect(result).toBeNull();
    });

    it("returns undefined when sessionClaims is empty object", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {} as never,
      );

      const result = await getSessionUser();
      expect(result).toBeUndefined();
    });

    it("returns user when sessionClaims has valid user", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/avatar.png",
        isAdmin: false,
      };
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        sessionClaims: {
          user: mockUser,
        },
      } as never);

      const result = await getSessionUser();
      expect(result).toEqual({
        ...mockUser,
        isAdmin: false,
      });
    });

    it("sets isAdmin to true when user email is admin email", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      const mockUser = {
        id: "user_123",
        email: "admin@example.com",
        name: "Admin User",
        image: "https://example.com/avatar.png",
        isAdmin: false,
      };
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        sessionClaims: {
          user: mockUser,
        },
      } as never);

      const result = await getSessionUser();
      expect(result).toEqual({
        ...mockUser,
        isAdmin: true,
      });
    });

    it("returns user without modification when no email present", async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
        "pk_test_51MH5aLknd8j8d7e9f3g4h5j6k7l8m9n0";
      const mockUser = {
        id: "user_123",
        name: "Test User",
        isAdmin: false,
      };
      (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        sessionClaims: {
          user: mockUser,
        },
      } as never);

      const result = await getSessionUser();
      expect(result).toEqual({
        ...mockUser,
        isAdmin: false,
      });
    });
  });
});
