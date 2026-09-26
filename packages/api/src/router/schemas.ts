import { z } from "zod";

import {
  CLUSTER_VALIDATION,
  PLAN_VALIDATION,
  USER_VALIDATION,
} from "@saasfly/common";

/**
 * Shared field schemas — single source of truth for validation rules that
 * are reused across multiple schemas (issue #609).
 *
 * `userIdSchema` validates a user identifier in UUID format and is reused by
 * the customer and profile input schemas below.
 */
export const userIdSchema = z.string().uuid("Invalid user ID format");

/**
 * Cluster identifier — a positive integer primary key of a cluster record.
 */
export const clusterIdSchema = z
  .number()
  .int("ID must be an integer")
  .positive("ID must be positive");

/**
 * Input for creating a Kubernetes cluster.
 *
 * `name` and `location` are required and validated against
 * {@link CLUSTER_VALIDATION}; `id` is optional and normally assigned by
 * the database.
 */
export const enhancedK8sClusterCreateSchema = z
  .object({
    id: z.number().optional(),
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        `Cluster name cannot exceed ${CLUSTER_VALIDATION.name.maxLength} characters`,
      )
      .regex(
        CLUSTER_VALIDATION.name.pattern,
        CLUSTER_VALIDATION.name.patternMessage,
      ),
    location: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.location.minLength, "Location cannot be empty")
      .max(
        CLUSTER_VALIDATION.location.maxLength,
        `Location cannot exceed ${CLUSTER_VALIDATION.location.maxLength} characters`,
      ),
  })
  .strict();

/**
 * Input for deleting a Kubernetes cluster: the target cluster `id` only.
 */
export const enhancedK8sClusterDeleteSchema = z
  .object({
    id: clusterIdSchema,
  })
  .strict();

/**
 * Input for updating a Kubernetes cluster.
 *
 * `name` and `location` are both optional, but at least one must be
 * provided; unknown fields are rejected by `.strict()`.
 */
export const enhancedK8sClusterUpdateSchema = z
  .object({
    id: clusterIdSchema,
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        `Cluster name cannot exceed ${CLUSTER_VALIDATION.name.maxLength} characters`,
      )
      .regex(
        CLUSTER_VALIDATION.name.pattern,
        CLUSTER_VALIDATION.name.patternMessage,
      )
      .optional(),
    location: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.location.minLength, "Location cannot be empty")
      .max(
        CLUSTER_VALIDATION.location.maxLength,
        `Location cannot exceed ${CLUSTER_VALIDATION.location.maxLength} characters`,
      )
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.location !== undefined,
    "At least one field (name or location) must be provided for update",
  );

/**
 * Input for creating a Stripe checkout or billing-portal session.
 *
 * `planId` must be a non-empty Stripe price identifier (`price_…`).
 */
export const enhancedStripeCreateSessionSchema = z
  .object({
    planId: z
      .string()
      .min(PLAN_VALIDATION.id.minLength, "Plan ID cannot be empty")
      .regex(/^price_/, "Plan ID must start with 'price_'"),
  })
  .strict();

/**
 * Input for updating the signed-in user's display name.
 *
 * `name` is validated against {@link USER_VALIDATION.displayName}; the
 * procedure additionally rejects `userId` values that differ from the caller.
 */
export const enhancedUpdateUserNameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER_VALIDATION.displayName.minLength, "Name cannot be empty")
      .max(
        USER_VALIDATION.displayName.maxLength,
        `Name cannot exceed ${USER_VALIDATION.displayName.maxLength} characters`,
      ),
    userId: userIdSchema,
  })
  .strict();

/**
 * Input for creating the customer record owned by `userId`.
 */
export const enhancedInsertCustomerSchema = z
  .object({
    userId: userIdSchema,
  })
  .strict();

/**
 * Input for fetching the customer record owned by `userId`.
 */
export const enhancedQueryCustomerSchema = z
  .object({
    userId: userIdSchema,
  })
  .strict();
