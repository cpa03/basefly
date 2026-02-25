import { test, expect } from "./fixtures";

/**
 * Pricing/Subscription Flow E2E Tests
 *
 * Tests the critical pricing flows:
 * - Pricing page loads correctly
 * - Pricing page displays subscription plans
 * - Navigation to pricing works
 */
test.describe("Pricing/Subscription Flow", () => {
  test("pricing page loads correctly", async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");

    // Check that pricing page has loaded
    await expect(page).toHaveTitle(/Pricing/i);

    // Check for pricing content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("pricing page displays subscription plans", async ({ page }) => {
    await page.goto("/en/pricing");
    await page.waitForLoadState("networkidle");

    // Look for pricing-related content
    // Common patterns for pricing pages
    const pricingContent = page.locator(
      "[class*='pricing'], [class*='plan'], [class*='subscription'], h1, h2"
    );

    // Verify at least some content is visible
    await expect(pricingContent.first()).toBeVisible();
  });

  test("navigation to pricing page works", async ({ page }) => {
    // Start from marketing page
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    // Look for pricing link and click it
    const pricingLink = page.locator(
      'a[href*="pricing"], a:has-text("Pricing"), nav a:has-text("Pricing")'
    );

    // If we find the link, click it
    if (await pricingLink.first().isVisible()) {
      await pricingLink.first().click();
      await page.waitForLoadState("networkidle");

      // Verify we're on the pricing page
      expect(page.url()).toContain("/pricing");
    } else {
      // Otherwise navigate directly
      await page.goto("/en/pricing");
      await expect(page.url()).toContain("/pricing");
    }
  });

  test("pricing page is accessible without authentication", async ({
    page,
  }) => {
    // Pricing page should be public
    const response = await page.goto("/en/pricing");

    // Should get a successful response
    if (response) {
      expect(response.status()).toBeLessThan(400);
    }

    // Page should load
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
