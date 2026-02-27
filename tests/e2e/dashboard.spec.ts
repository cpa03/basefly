import { test, expect } from "./fixtures";

test.describe("Dashboard Access Flow", () => {
  test("unauthenticated user is redirected from dashboard to login", async ({ page }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/.*\/en\/login/);
  });

  test("dashboard requires authentication", async ({ page }) => {
    const response = await page.goto("/en/dashboard");
    expect(response?.status()).toBeGreaterThanOrEqual(300);
  });
});
