/**
 * CSRF validation tests
 *
 * Behavioral tests for `validateCSRF` in `apps/nextjs/src/lib/csrf.ts`.
 *
 * Reference: Issue #515 - [P1][Security] Add CSRF protection for form submissions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateCSRF } from "./csrf";

function makeRequest(
  method: string,
  headers: Record<string, string> = {},
): { method: string; headers: Headers } {
  return { method, headers: new Headers(headers) };
}

describe("validateCSRF", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.CSRF_ALLOWED_ORIGINS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("allows non-POST methods without Origin checks", () => {
    expect(validateCSRF(makeRequest("GET"))).toBe(true);
    expect(validateCSRF(makeRequest("HEAD"))).toBe(true);
    expect(validateCSRF(makeRequest("OPTIONS"))).toBe(true);
  });

  it("allows POST requests without an Origin header", () => {
    expect(validateCSRF(makeRequest("POST"))).toBe(true);
  });

  it("allows POST when Origin matches NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    const req = makeRequest("POST", { origin: "https://app.example.com" });
    expect(validateCSRF(req)).toBe(true);
  });

  it("allows POST when Origin matches the request Host", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    const req = makeRequest("POST", {
      origin: "https://custom-domain.example",
      host: "custom-domain.example",
    });
    expect(validateCSRF(req)).toBe(true);
  });

  it("allows POST when Origin matches Host even without NEXT_PUBLIC_APP_URL", () => {
    const req = makeRequest("POST", {
      origin: "http://localhost:3000",
      host: "localhost:3000",
    });
    expect(validateCSRF(req)).toBe(true);
  });

  it("rejects POST with a cross-origin Origin header", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    const req = makeRequest("POST", {
      origin: "https://evil.example.com",
      host: "app.example.com",
    });
    expect(validateCSRF(req)).toBe(false);
  });

  it("rejects POST with a malformed Origin header", () => {
    const req = makeRequest("POST", {
      origin: "not-a-url",
      host: "app.example.com",
    });
    expect(validateCSRF(req)).toBe(false);
  });

  it("rejects POST when Origin matches neither Host nor NEXT_PUBLIC_APP_URL", () => {
    const req = makeRequest("POST", {
      origin: "https://evil.example.com",
      host: "app.example.com",
    });
    expect(validateCSRF(req)).toBe(false);
  });

  it("allows POST with an Origin listed in CSRF_ALLOWED_ORIGINS", () => {
    process.env.CSRF_ALLOWED_ORIGINS = "https://partner.example.com";
    const req = makeRequest("POST", {
      origin: "https://partner.example.com",
      host: "app.example.com",
    });
    expect(validateCSRF(req)).toBe(true);
  });

  it("honors multiple comma-separated allowed origins", () => {
    process.env.CSRF_ALLOWED_ORIGINS =
      "https://one.example.com, https://two.example.com";
    const req = makeRequest("POST", {
      origin: "https://two.example.com",
      host: "app.example.com",
    });
    expect(validateCSRF(req)).toBe(true);
  });
});
