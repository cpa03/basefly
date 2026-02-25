import { test as base, Page, expect } from "@playwright/test";

export { expect } from "@playwright/test";
export const test = base;
export type TestType = typeof base;

export const testData = {
  validEmail: "test@example.com",
  testClusterName: "test-cluster-e2e",
  testClusterRegion: "us-west-1",
};

export async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function clearAndFill(page: Page, selector: string, value: string) {
  await page.fill(selector, "");
  await page.fill(selector, value);
}

export { expect } from "@playwright/test";
