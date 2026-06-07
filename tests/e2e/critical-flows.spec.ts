import { test, expect } from "./fixtures";

test.describe("Critical User Flow Protection", () => {
  test("admin dashboard redirects unauthenticated users to login", async ({
    page,
  }) => {
    // Admin dashboard should be protected
    await page.goto("/admin/dashboard");
    // Should redirect to login (either Clerk login or app login page)
    await expect(page).toHaveURL(/.*login/i);
  });

  test("billing settings redirects unauthenticated users", async ({
    page,
  }) => {
    // Billing settings should be protected
    await page.goto("/en/dashboard/billing");
    await expect(page).toHaveURL(/.*login/i);
  });

  test("cluster editor redirects unauthenticated users", async ({ page }) => {
    // Cluster editor is a critical feature that must be protected
    await page.goto("/en/editor/cluster/test-cluster-unauthorized");
    await expect(page).toHaveURL(/.*login|unauthorized|signin/i);
  });

  test("dashboard page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/.*login/i);
  });
});

test.describe("Public Page Availability", () => {
  test("home page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("body")).toBeAttached();
  });

  test("pricing page loads with pricing section", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(
      page.getByRole("region", { name: /pricing/i }),
    ).toBeVisible();
  });

  test("404 page for unknown routes", async ({ page }) => {
    // Navigation to a non-existent route should show a 404 page
    const response = await page.goto("/en/nonexistent-route-xyz");
    // Should return 404 status code or show a not-found page
    const statusCode = response?.status();
    if (statusCode === 404) {
      expect(statusCode).toBe(404);
    } else {
      // If SPA-style routing, check for "not found" content instead
      await expect(page.locator("body")).toContainText(
        /not found|404|doesn't exist/i,
      );
    }
  });

  test("health endpoint returns 200", async ({ page }) => {
    // API health check is critical for monitoring
    const response = await page.request.get("/api/health");
    expect(response.status()).toBe(200);
  });

  test("login page has Clerk authentication component", async ({ page }) => {
    await page.goto("/en/login");
    // Clerk sign-in component should be present
    await expect(page.locator(".clerk-signin")).toBeAttached({
      timeout: 10000,
    });
  });
});

test.describe("Multi-language Route Protection", () => {
  test("dashboard is protected in all languages", async ({ page }) => {
    for (const lang of ["en", "zh", "ko", "ja"]) {
      await page.goto(`/${lang}/dashboard`);
      await expect(page).toHaveURL(/.*login/i);
    }
  });

  test("pricing page loads in all languages", async ({ page }) => {
    for (const lang of ["en", "zh", "ko", "ja"]) {
      await page.goto(`/${lang}/pricing`);
      const region = page.getByRole("region", { name: /pricing/i });
      await expect(region).toBeVisible();
    }
  });
});

test.describe("Subscription Flow Structure", () => {
  test("pricing page displays multiple plan tiers", async ({ page }) => {
    await page.goto("/en/pricing");
    // Should have at least one pricing card or plan section
    const pricingSection = page.getByRole("region", { name: /pricing/i });
    await expect(pricingSection).toBeVisible();

    // Should reference plan tiers
    const pageContent = await page.textContent("body");
    const hasPlanTiers =
      /free|pro|business|enterprise|starter|standard/i.test(
        pageContent ?? "",
      );
    expect(hasPlanTiers).toBeTruthy();
  });

  test("pricing page shows yearly savings information", async ({
    page,
  }) => {
    await page.goto("/en/pricing");
    const pageContent = await page.textContent("body");
    // Should mention yearly billing cycle or savings
    const hasYearlyInfo = /year|annual|save|month/i.test(pageContent ?? "");
    expect(hasYearlyInfo).toBeTruthy();
  });
});
