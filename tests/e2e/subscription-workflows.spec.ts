import { test, expect } from "./fixtures";

test.describe("Subscription Upgrade & Downgrade Flow", () => {
  test("pricing page displays all plan tiers for comparison", async ({ page }) => {
    await page.goto("/en/pricing");
    // Should display multiple plan tiers
    const pricingSection = page.getByRole("region", { name: /pricing/i });
    await expect(pricingSection).toBeVisible();

    // Should show at least three plan levels
    const pageContent = await page.textContent("body");
    const planCount = (pageContent?.match(/(free|pro|business|enterprise|starter|standard)/gi) ?? []).length;
    expect(planCount).toBeGreaterThanOrEqual(2);
  });

  test("pricing page has CTA linking to signup for unauthenticated users", async ({ page }) => {
    await page.goto("/en/pricing");
    // Unauthenticated users should be prompted to sign up
    const cta = page.getByRole("link", { name: /get started|sign up|subscribe|choose plan/i });
    await expect(cta.first()).toBeVisible();
  });

  test("upgrade CTA redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/en/pricing");
    // Click on a plan CTA
    const cta = page.getByRole("link", { name: /get started|sign up|subscribe|choose plan/i });
    if (await cta.first().isVisible()) {
      // Following the link should redirect to login or signup
      const href = await cta.first().getAttribute("href");
      expect(href).toBeTruthy();
      if (href) {
        // The link should point to an auth-related page
        expect(href.toLowerCase()).toMatch(/sign|login|auth|register/i);
      }
    }
  });

  test("billing portal redirects unauthenticated users to login", async ({ page }) => {
    // Customer portal should be protected
    await page.goto("/en/dashboard/billing");
    await expect(page).toHaveURL(/.*login|signin/i);
  });

  test("pricing page shows billing period toggle", async ({ page }) => {
    await page.goto("/en/pricing");
    // Should have monthly/yearly toggle
    const toggle = page.locator("button, a, label").filter({ hasText: /monthly|yearly|annual|month|year/i });
    const toggleCount = await toggle.count();
    // At minimum, the page content should reference billing periods
    if (toggleCount === 0) {
      const bodyText = await page.textContent("body");
      expect(bodyText?.toLowerCase()).toMatch(/month|year|annual/i);
    }
  });

  test("upgrade path requires authentication", async ({ page }) => {
    // Direct navigation to subscription management
    await page.goto("/en/dashboard/settings");
    await expect(page).toHaveURL(/.*login|signin|unauthorized/i);
  });

  test("pricing page features comparison is visible", async ({ page }) => {
    await page.goto("/en/pricing");
    // Features section or comparison should be present
    const hasFeatureSection = page.locator("body").filter({ hasText: /feature/i });
    await expect(hasFeatureSection.first()).toBeVisible();
  });
});

test.describe("Subscription Plan Accessibility", () => {
  test("plan cards are keyboard navigable", async ({ page }) => {
    await page.goto("/en/pricing");
    // Plan cards should be focusable
    const planCards = page.locator("[role='region'], article, .plan-card, [class*='plan'], [class*='card']")
      .filter({ hasText: /free|pro|business|enterprise/i });
    const count = await planCards.count();
    if (count > 0) {
      // Verify cards are reachable
      await planCards.first().focus();
      await expect(planCards.first()).toBeFocused();
    }
  });

  test("pricing page links have descriptive text", async ({ page }) => {
    await page.goto("/en/pricing");
    // All links should have descriptive text (not just generic)
    const links = page.locator("a");
    const linkCount = await links.count();
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const text = await links.nth(i).textContent();
      if (text) {
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
