/**
 * Standardized tRPC response contracts (Issue #610)
 *
 * Defines the shared response format convention for all tRPC routers:
 *
 * - **Mutations** return `MutationResult<T>` — a discriminated `success`
 *   field (boolean) plus any procedure-specific payload.
 * - **Queries** return raw data (`QueryResult<T>`) — tRPC queries are
 *   read-only and consumers receive the data directly; failures are
 *   propagated as errors via `createApiError` (see `../errors`).
 *
 * Convention:
 * ```
 * // Mutation success with payload
 * return { success: true as const, id: newCluster.id };
 *
 * // Mutation success without payload
 * return { success: true as const };
 *
 * // Query (raw data)
 * return await db.selectFrom("Customer").executeTakeFirst();
 * ```
 */

/** Successful mutation acknowledgment without a payload. */
export interface SuccessAck {
  success: true;
}

/** Successful mutation carrying a procedure-specific payload. */
export type SuccessWith<T> = T & { success: true };

/**
 * Explicit mutation failure returned to the client (rather than a thrown
 * error). Only used when the procedure intentionally short-circuits with a
 * non-throwing result (e.g. missing optional Stripe session URL).
 */
export interface FailureResult {
  success: false;
}

/**
 * Union of mutation results. `T` is the optional success payload shape
 * (defaults to an empty record, i.e. a bare `{ success: true }`).
 * Procedures that never return `{ success: false }` keep a narrower type
 * inferred by the compiler; the union documents the full convention.
 */
export type MutationResult<T = Record<string, never>> =
  | SuccessAck
  | SuccessWith<T>
  | FailureResult;

/**
 * Query result — queries return raw data directly rather than wrapping it.
 * `T` is the underlying data type (record, array, or `undefined`).
 */
export type QueryResult<T> = T;
