import { test, expect } from "./fixtures";

test.describe("Billing & Subscription Flow", () => {
  test("billing page redirects unauthenticated users", async ({ page }) => {
    // Billing page should require authentication
    await page.goto("/en/dashboard/billing");
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*\/en\/login/);
  });

  test("pricing page displays subscription tiers", async ({ page }) => {
    await page.goto("/en/pricing");
    // Should show the pricing section
    await expect(page.getByRole("region", { name: /pricing/i })).toBeVisible();
    // Should have call-to-action for sign-up
    const cta = page.getByRole("link", { name: /get started|sign up|subscribe|choose plan/i });
    await expect(cta.first()).toBeVisible();
  });

  test("pricing page FAQ includes billing related questions", async ({ page }) => {
    await page.goto("/en/pricing");
    // FAQ section should be visible
    await expect(page.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();
    // Should contain billing/subscription related FAQ content
    const faqSection = page.locator("section").filter({ hasText: /faq|question|answer/i });
    await expect(faqSection.first()).toBeVisible();
  });

  test("dashboard billing settings page is protected", async ({ page }) => {
    // Access billing settings without authentication
    await page.goto("/en/dashboard/settings");
    // Should redirect to login or show access denied
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|signin|unauthorized/i);
  });

  test("pricing page has yearly and monthly billing options", async ({ page }) => {
    await page.goto("/en/pricing");
    // Check that pricing cards display billing period information
    const pageContent = await page.textContent("body");
    // Should mention monthly or yearly billing periods
    const hasBillingPeriod = /month|year|annual/i.test(pageContent ?? "");
    expect(hasBillingPeriod).toBeTruthy();
  });
});
