import { test as base, Page } from "@playwright/test";

/**
 * Custom fixtures for E2E testing
 */

export { expect } from "@playwright/test";

/**
 * Test data fixtures
 */
export const testData = {
  // Test user credentials (use env vars in production)
  testUser: {
    email: process.env.E2E_TEST_USER_EMAIL || "test@example.com",
    password: process.env.E2E_TEST_USER_PASSWORD || "testpassword123",
  },
  // Base URLs
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  // Timeout values
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};

/**
 * Custom test with fixtures
 */
export const test = base.extend<{
  testData: typeof testData;
}>({
  testData: [testData, { option: true }],
});

/**
 * Helper functions for common E2E operations
 */
export async function waitForPageToLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
}
