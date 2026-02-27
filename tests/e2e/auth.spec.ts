import { test, expect } from "./fixtures";

test.describe("Authentication Flow", () => {
  test("login page loads correctly", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.getByRole("link", { name: /go to home page/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("login page has back link to home", async ({ page }) => {
    await page.goto("/en/login");
    const backLink = page.getByRole("link", { name: /go to home page/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", /\/en$/);
  });

  test("login page renders clerk sign in component", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page.locator(".clerk-signin")).toBeVisible({ timeout: 10000 });
  });
});
