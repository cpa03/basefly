/**
 * Tests for Request ID Utility
 */

import { beforeEach, describe, expect, it } from "vitest";

import {
  createRequestContext,
  extractRequestId,
  generateRequestId,
  getOrGenerateRequestId,
  isValidRequestId,
  REQUEST_ID_HEADER,
} from "./request-id";

describe("generateRequestId", () => {
  it("should generate a valid UUID v4 format", () => {
    const requestId = generateRequestId();

    // Should match UUID v4 pattern
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("should generate unique IDs", () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();

    expect(id1).not.toBe(id2);
  });

  it("should generate consistent length", () => {
    const requestId = generateRequestId();
    expect(requestId).toHaveLength(36); // UUID v4 is 36 characters with dashes
  });

  it("should generate IDs with valid format components", () => {
    const requestId = generateRequestId();
    const parts = requestId.split("-");

    // UUID v4 has 5 parts separated by dashes
    expect(parts).toHaveLength(5);

    // Part lengths: 8-4-4-4-12
    expect(parts[0]).toHaveLength(8);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toHaveLength(4);
    expect(parts[2]).toMatch(/^4/); // Version 4 starts with 4
    expect(parts[3]).toHaveLength(4);
    expect(parts[3]).toMatch(/^[89ab]/i); // Variant 1
    expect(parts[4]).toHaveLength(12);
  });
});

describe("extractRequestId", () => {
  it("should extract valid request ID from headers", () => {
    const headers = new Headers();
    const testId = "a1b2c3d4-e5f6-4789-abcd-ef1234567890";
    headers.set(REQUEST_ID_HEADER, testId);

    const extracted = extractRequestId(headers);
    expect(extracted).toBe(testId);
  });

  it("should return null if request ID header is missing", () => {
    const headers = new Headers();

    const extracted = extractRequestId(headers);
    expect(extracted).toBeNull();
  });

  it("should return null if request ID is invalid format", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "invalid-uuid");

    const extracted = extractRequestId(headers);
    expect(extracted).toBeNull();
  });

  it("should return null if request ID is empty string", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "");

    const extracted = extractRequestId(headers);
    expect(extracted).toBeNull();
  });

  it("should handle case-insensitive UUID validation", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "A1B2C3D4-E5F6-4789-ABCD-EF1234567890");

    const extracted = extractRequestId(headers);
    expect(extracted).toBe("A1B2C3D4-E5F6-4789-ABCD-EF1234567890");
  });
});

describe("getOrGenerateRequestId", () => {
  it("should return existing valid request ID from headers", () => {
    const headers = new Headers();
    const testId = "a1b2c3d4-e5f6-4789-abcd-ef1234567890";
    headers.set(REQUEST_ID_HEADER, testId);

    const requestId = getOrGenerateRequestId(headers);
    expect(requestId).toBe(testId);
  });

  it("should generate new ID if header is missing", () => {
    const headers = new Headers();

    const requestId = getOrGenerateRequestId(headers);
    expect(requestId).toBeDefined();
    expect(isValidRequestId(requestId)).toBe(true);
  });

  it("should generate new ID if header has invalid ID", () => {
    const headers = new Headers();
    headers.set(REQUEST_ID_HEADER, "invalid");

    const requestId = getOrGenerateRequestId(headers);
    expect(requestId).toBeDefined();
    expect(isValidRequestId(requestId)).toBe(true);
    expect(requestId).not.toBe("invalid");
  });
});

describe("isValidRequestId", () => {
  it("should return true for valid UUID v4", () => {
    const validId = "a1b2c3d4-e5f6-4789-abcd-ef1234567890";
    expect(isValidRequestId(validId)).toBe(true);
  });

  it("should return true for UUID v4 with different variant bits", () => {
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-8bcd-ef1234567890")).toBe(true);
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-9bcd-ef1234567890")).toBe(true);
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-abcd-ef1234567890")).toBe(true);
  });

  it("should return false for invalid format", () => {
    expect(isValidRequestId("invalid")).toBe(false);
    expect(isValidRequestId("a1b2c3d4-e5f6-4789")).toBe(false);
    expect(isValidRequestId("")).toBe(false);
    expect(isValidRequestId("not-a-uuid")).toBe(false);
  });

  it("should return false for wrong UUID version", () => {
    // Version 1 UUID (starts with 1)
    expect(isValidRequestId("a1b2c3d4-e5f6-1789-abcd-ef1234567890")).toBe(
      false,
    );

    // Version 3 UUID (starts with 3)
    expect(isValidRequestId("a1b2c3d4-e5f6-3789-abcd-ef1234567890")).toBe(
      false,
    );

    // Version 5 UUID (starts with 5)
    expect(isValidRequestId("a1b2c3d4-e5f6-5789-abcd-ef1234567890")).toBe(
      false,
    );
  });

  it("should return false for invalid variant bits", () => {
    // Variant 0 (starts with 0-7)
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-0bcd-ef1234567890")).toBe(
      false,
    );

    // Variant 2 (starts with c-f)
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-cbcd-ef1234567890")).toBe(
      false,
    );
  });

  it("should be case-insensitive", () => {
    expect(isValidRequestId("A1B2C3D4-E5F6-4789-ABCD-EF1234567890")).toBe(true);
    expect(isValidRequestId("a1b2c3d4-e5f6-4789-abcd-ef1234567890")).toBe(true);
  });
});

describe("createRequestContext", () => {
  it("should create context object with valid request ID", () => {
    const testId = "a1b2c3d4-e5f6-4789-abcd-ef1234567890";
    const context = createRequestContext(testId);

    expect(context).toEqual({ requestId: testId });
  });

  it("should throw error for invalid request ID", () => {
    expect(() => createRequestContext("invalid")).toThrow("Invalid request ID");
  });

  it("should throw error for empty string", () => {
    expect(() => createRequestContext("")).toThrow("Invalid request ID");
  });

  it("should throw error for missing request ID", () => {
    expect(() =>
      createRequestContext(undefined as unknown as string),
    ).toThrow();
  });
});

describe("REQUEST_ID_HEADER constant", () => {
  it("should export the correct header name", () => {
    expect(REQUEST_ID_HEADER).toBe("X-Request-ID");
  });
});
