import { test, expect } from "./fixtures";

test.describe("Home Page Flow", () => {
  test("home page loads correctly", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/Basefly/i);
  });

  test("home page displays navigation", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("home page has login link", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("link", { name: /login/i }).first()).toBeVisible();
  });

  test("home page has pricing link", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();
  });
});
