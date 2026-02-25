/**
 * Test Utilities for tRPC Router Integration Tests
 *
 * Provides mock factories for creating tRPC contexts and callers
 * for testing protected procedures.
 *
 * @module test-utils
 */

import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "./trpc";

/**
 * Creates a mock authenticated context for testing protected procedures
 */
export function createMockContext(options?: {
  userId?: string;
  requestId?: string;
}): TRPCContext {
  return {
    userId: options?.userId ?? "test-user-id",
    requestId: options?.requestId ?? "test-request-id",
    rateLimitInfo: null,
    headers: new Headers(),
    auth: {
      userId: options?.userId ?? "test-user-id",
      sessionId: "test",
    } as TRPCContext["auth"],
    req: undefined,
  };
}

/**
 * Creates an anonymous (unauthenticated) context for testing
 */
export function createAnonymousContext(options?: {
  requestId?: string;
}): TRPCContext {
  return {
    userId: null,
    requestId: options?.requestId ?? "test-request-id",
    rateLimitInfo: null,
    headers: new Headers(),
    auth: null,
    req: undefined,
  };
}

/**
 * Mock authentication object similar to Clerk's getAuth()
 */
export interface MockAuthObject {
  userId: string | null;
  sessionId: string | null;
  claims: Record<string, unknown> | null;
}

/**
 * Creates a mock Clerk auth object
 */
export function createMockAuth(options?: {
  userId?: string | null;
}): MockAuthObject {
  return {
    userId: options?.userId ?? "test-user-id",
    sessionId: "test-session-id",
    claims: {
      sub: options?.userId ?? "test-user-id",
      email: "test@example.com",
    },
  };
}

/**
 * Creates an anonymous mock auth object
 */
export function createAnonymousAuth(): MockAuthObject {
  return {
    userId: null,
    sessionId: null,
    claims: null,
  };
}

/**
 * Test data factory for creating mock customer records
 */
export const mockCustomer = {
  id: "cust_123",
  authUserId: "test-user-id",
  plan: "FREE" as const,
  stripeCustomerId: "cus_test123",
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeCurrentPeriodEnd: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Test data factory for creating mock user records
 */
export const mockUser = {
  id: "test-user-id",
  authUserId: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Test data factory for creating mock K8s cluster records
 */
export const mockCluster = {
  id: 1,
  name: "test-cluster",
  location: "us-west-1",
  network: "10.0.0.0/16",
  plan: "FREE",
  status: "RUNNING" as const,
  authUserId: "test-user-id",
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock database query builder for testing
 */
export class MockQueryBuilder<T> {
  private data: T[];
  private selectFields: (keyof T)[] = [];

  constructor(private mockData: T[]) {
    this.data = [...mockData];
  }

  select(fields: (keyof T)[]): this {
    this.selectFields = fields;
    return this;
  }

  where(field: keyof T, _op: string, value: unknown): this {
    this.data = this.data.filter((item) => item[field] === value);
    return this;
  }

  executeTakeFirst(): T | undefined {
    return this.data[0];
  }

  execute(): T[] {
    return this.data;
  }

  returning(_fields: (keyof T)[]): this {
    return this;
  }

  set(_values: Partial<T>): this {
    return this;
  }

  values(_values: Partial<T>): this {
    return this;
  }
}

/**
 * Creates a mock database for testing router procedures
 */
export interface MockDatabase {
  selectFrom: () => MockQueryBuilder<unknown>;
  insertInto: () => MockQueryBuilder<unknown>;
  updateTable: () => MockQueryBuilder<unknown>;
}

export function createMockDatabase(data?: {
  customers?: (typeof mockCustomer)[];
  users?: (typeof mockUser)[];
  clusters?: (typeof mockCluster)[];
}): MockDatabase {
  const customers = data?.customers ?? [mockCustomer];
  const users = data?.users ?? [mockUser];
  const clusters = data?.clusters ?? [mockCluster];

  return {
    selectFrom: () => {
      const builder = new MockQueryBuilder([
        ...customers,
        ...users,
        ...clusters,
      ]);
      return builder as unknown as MockQueryBuilder<unknown>;
    },
    insertInto: () => {
      return {
        values: () => ({
          executeTakeFirst: () => ({ id: 1 }),
          execute: () => [],
        }),
      } as unknown as MockQueryBuilder<unknown>;
    },
    updateTable: () => {
      return {
        set: () => ({
          where: () => ({
            execute: () => [],
          }),
        }),
      } as unknown as MockQueryBuilder<unknown>;
    },
  };
}

/**
 * Helper to check if a thrown error is a TRPCError
 */
export function isTRPCError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

/**
 * Helper to extract error code from thrown error
 */
export function getTRPCErrorCode(error: unknown): string | undefined {
  if (isTRPCError(error)) {
    return error.code;
  }
  return undefined;
}
