import { test, expect } from "./fixtures";

test.describe("Pricing Page Flow", () => {
  test("pricing page loads correctly", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.getByRole("heading", { name: /pricing/i, level: 1 })).toBeVisible();
  });

  test("pricing page displays pricing cards", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.getByRole("region", { name: /pricing/i })).toBeVisible();
  });

  test("pricing page displays FAQ section", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.getByRole("heading", { name: /frequently asked questions/i })).toBeVisible();
  });
});
