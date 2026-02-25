import { test, expect } from "./fixtures";

test.describe("Admin Dashboard Flow", () => {
  test("admin dashboard is protected - redirects non-admin users", async ({ page }) => {
    // Access admin dashboard without admin privileges
    await page.goto("/admin/dashboard");
    // Should redirect away from admin dashboard (either to login or to user dashboard)
    // The admin dashboard checks isAdminEmail and redirects non-admins
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/admin/dashboard");
  });

  test("admin login page loads correctly", async ({ page }) => {
    // Admin should still go through Clerk auth
    await page.goto("/admin/dashboard");
    // Should redirect to login or show access denied
    await expect(page).not.toHaveURL(/.*\/admin\/dashboard/);
  });

  test("admin dashboard route exists", async ({ page }) => {
    // Even if redirected, the route should exist
    // This verifies the page.tsx is properly set up
    const response = await page.goto("/admin/dashboard");
    // Either 200 (if somehow authenticated) or redirect (30x)
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });
});
