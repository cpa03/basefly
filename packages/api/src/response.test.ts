import { describe, expect, it } from "vitest";

import type {
  FailureResult,
  MutationResult,
  QueryResult,
  SuccessAck,
  SuccessWith,
} from "./response";

/**
 * Contract tests for the standardized tRPC response types (Issue #610).
 * These are compile-time-oriented assertions that document the runtime
 * shapes routers are expected to return.
 */

describe("response contract types", () => {
  it("documents a bare success mutation result", () => {
    // Runtime shape: { success: true } with no payload.
    const bareSuccess = { success: true as const } satisfies MutationResult;
    expect(bareSuccess.success).toBe(true);
  });

  it("documents a success mutation result with a payload", () => {
    // Runtime shape: payload fields merged with the success discriminator.
    const withPayload = {
      id: 42,
      clusterName: "prod",
      location: "us-east-1",
      success: true as const,
    } satisfies MutationResult<{
      id: number;
      clusterName: string;
      location: string;
    }>;
    expect(withPayload.success).toBe(true);
    expect(withPayload.id).toBe(42);
    expect(withPayload.clusterName).toBe("prod");
  });

  it("documents an explicit failure result (non-throwing short-circuit)", () => {
    const failed = { success: false as const } satisfies FailureResult;
    expect(failed.success).toBe(false);
  });

  it("narrows MutationResult on the success discriminator", () => {
    const result: MutationResult<{ url: string }> = {
      success: true,
      url: "https://example.com",
    };
    if (result.success) {
      // Inside the success branch, the payload is available and typed.
      expect(typeof result.url).toBe("string");
    }
  });

  it("documents raw query results (queries return data directly)", () => {
    const rawCustomer = { id: 1, plan: "FREE" } satisfies QueryResult<{
      id: number;
      plan: string;
    }>;
    expect(rawCustomer.plan).toBe("FREE");

    const rawList: QueryResult<{ id: number }[]> = [{ id: 1 }, { id: 2 }];
    expect(rawList).toHaveLength(2);

    const maybeMissing: QueryResult<{ id: number } | undefined> = undefined;
    expect(maybeMissing).toBeUndefined();
  });

  it("exposes the constituent type aliases", () => {
    // SuccessAck is the bare `{ success: true }` shape.
    const ack: SuccessAck = { success: true };
    expect(ack.success).toBe(true);

    // SuccessWith<T> merges a payload with the success discriminator.
    const withData: SuccessWith<{ url: string }> = {
      success: true,
      url: "/checkout",
    };
    expect(withData.url).toBe("/checkout");

    // FailureResult is the explicit `{ success: false }` shape.
    const fail: FailureResult = { success: false };
    expect(fail.success).toBe(false);
  });
});
