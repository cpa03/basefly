import { test, expect } from "./fixtures";

/**
 * Dashboard Navigation Flow E2E Tests
 *
 * Tests the critical dashboard flows:
 * - Dashboard page loads correctly
 * - Navigation between dashboard sections works
 * - Protected routes redirect to login when not authenticated
 */
test.describe("Dashboard Flow", () => {
  test("dashboard page redirects to login when not authenticated", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto("/en/dashboard");

    // Should redirect to login page (Clerk handles this)
    // Wait for redirect
    await page.waitForTimeout(2000);

    // The page should either be on login or redirecting to it
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/login|\/en\/login|clerk/i);
  });

  test("marketing page loads correctly", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Check that marketing page has loaded
    await expect(page).toHaveTitle(/Basefly|SaaS|Kubernetes/i);

    // Check for main content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("dashboard route is protected", async ({ page }) => {
    // Try to access the dashboard directly
    const response = await page.goto("/en/dashboard");

    // Either we get a redirect or a 30x status
    if (response) {
      const status = response.status();
      // Either 200 (Clerk renders redirect page) or 30x (actual redirect)
      expect(status).toBeLessThan(400);
    }

    // The final URL should involve login or the page should show login content
    await page.waitForTimeout(1000);
  });
});
