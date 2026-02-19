import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionUser } from "./clerk";
import { authOptions, getCurrentUser } from "./index";

vi.mock("./clerk", () => ({
  getSessionUser: vi.fn(),
  isClerkEnabled: vi.fn(() => true),
}));

describe("Auth Index Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should call getSessionUser and return its result", async () => {
      const mockUser = {
        id: "user_123",
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.png",
        isAdmin: false,
      };
      vi.mocked(getSessionUser).mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(getSessionUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should return null when getSessionUser returns null", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });

    it("should propagate errors from getSessionUser", async () => {
      const error = new Error("Session error");
      vi.mocked(getSessionUser).mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toThrow("Session error");
    });

    it("should handle admin user correctly", async () => {
      const mockAdminUser = {
        id: "admin_123",
        name: "Admin User",
        email: "admin@example.com",
        image: "https://example.com/admin.png",
        isAdmin: true,
      };
      vi.mocked(getSessionUser).mockResolvedValue(mockAdminUser);

      const result = await getCurrentUser();

      expect(result?.isAdmin).toBe(true);
    });
  });

  describe("exports", () => {
    it("should export authOptions with correct signIn page", () => {
      expect(authOptions.pages.signIn).toBe("/login");
    });

    it("should export isClerkEnabled as a function", async () => {
      const { isClerkEnabled } = await import("./index");
      expect(typeof isClerkEnabled).toBe("function");
    });
  });
});
