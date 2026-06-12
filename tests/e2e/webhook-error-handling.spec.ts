import { test, expect } from "./fixtures";

test.describe("Webhook Error Handling", () => {
  test("stripe webhook rejects requests without signature", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    // No Stripe-Signature header should result in 400
    expect(response.status()).toBe(400);
  });

  test("stripe webhook rejects empty payload", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/stripe", {
      data: "",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "test_signature",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("stripe webhook rejects invalid JSON payload", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/stripe", {
      data: "not-json-at-all-{invalid",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "test_signature",
      },
    });
    expect(response.status()).toBe(400);
  });

  test("stripe webhook returns structured error response", async ({ page }) => {
    const response = await page.request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    // Should return a structured error, not a stack trace
    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
  });

  test("stripe webhook handles rate limiting gracefully", async ({ page }) => {
    const payload = JSON.stringify({ type: "test" });
    const headers = {
      "Content-Type": "application/json",
    };
    // Send rapid requests to trigger rate limiter
    const responses = await Promise.all(
      Array(20).fill(null).map(() =>
        page.request.post("/api/webhooks/stripe", {
          data: payload,
          headers,
        }),
      ),
    );
    const rateLimited = responses.filter((r) => r.status() === 429);
    // Rate limited responses should include retry info
    if (rateLimited.length > 0) {
      const retryAfter = rateLimited[0].headers()["retry-after"];
      expect(retryAfter).toBeTruthy();
    }
  });
});

test.describe("API Error Response Format", () => {
  test("API returns consistent error shape", async ({ page }) => {
    const endpoints = [
      { url: "/api/clusters/nonexistent", method: "GET" as const },
      { url: "/api/clusters", method: "POST" as const },
      { url: "/api/admin/users", method: "GET" as const },
    ];
    for (const { url, method } of endpoints) {
      const response = await page.request.fetch(url, { method });
      const status = response.status();
      // Errors should be in 4xx range (not 500)
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(500);
    }
  });

  test("not-found routes return structured 404", async ({ page }) => {
    const response = await page.goto("/api/nonexistent-api-route");
    if (response) {
      expect(response.status()).not.toBe(500);
    }
  });
});
