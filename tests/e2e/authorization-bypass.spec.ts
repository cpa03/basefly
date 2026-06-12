import { test, expect } from "./fixtures";

test.describe("Authorization Bypass Prevention", () => {
  test("admin routes redirect non-admin users", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/.*login|signin|unauthorized/i);
  });

  test("admin API rejects unauthenticated requests", async ({ page }) => {
    const response = await page.request.get("/api/admin/users");
    expect([401, 403, 404]).toContain(response.status());
  });

  test("admin settings route is protected", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/.*login|signin|unauthorized/i);
  });

  test("API keys endpoint is protected", async ({ page }) => {
    const response = await page.request.get("/api/keys");
    expect([401, 403, 404]).toContain(response.status());
  });

  test("sensitive config endpoint rejects unauthorized", async ({ page }) => {
    const response = await page.request.get("/api/admin/config");
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("API Route Hardening", () => {
  test("stripe webhook endpoint does not expose internal details", async ({ page }) => {
    // Send invalid payload to webhook endpoint
    const response = await page.request.post("/api/webhooks/stripe", {
      data: "invalid-payload",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Should not return 500 or expose stack traces
    expect(response.status()).not.toBe(500);
    const body = await response.text();
    expect(body.toLowerCase()).not.toContain("stacktrace");
    expect(body.toLowerCase()).not.toContain("error:") ;
  });

  test("rate-limited endpoints return proper status code", async ({ page }) => {
    // Hit the webhook endpoint rapidly to trigger rate limiting
    const requests = Array(15).fill(null).map(() =>
      page.request.post("/api/webhooks/stripe", {
        data: JSON.stringify({ type: "test" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const responses = await Promise.all(requests);
    // At least one response should be rate-limited
    const rateLimited = responses.filter((r) => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThanOrEqual(1);
  });

  test("health endpoint does not leak configuration", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    // Should not expose secrets or internal config
    expect(body).not.toHaveProperty("secrets");
    expect(body).not.toHaveProperty("apiKey");
    expect(body).not.toHaveProperty("database_url");
  });
});

test.describe("IDOR Prevention", () => {
  test("other users cluster data is not accessible", async ({ page }) => {
    // Attempt to access another user's cluster directly
    await page.goto("/en/editor/cluster/other-users-cluster-123");
    await expect(page).toHaveURL(/.*login|signin|unauthorized/i);
  });

  test("sequential ID enumeration does not expose data", async ({ page }) => {
    // Try common sequential IDs
    const ids = ["1", "2", "3", "100", "1000"];
    for (const id of ids) {
      const response = await page.request.get(`/api/clusters/${id}`);
      expect([401, 403, 404]).toContain(response.status());
    }
  });
});
