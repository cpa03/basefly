import { z } from "zod";

import {
  CLUSTER_VALIDATION,
  PLAN_VALIDATION,
  USER_VALIDATION,
} from "@saasfly/common";

export const enhancedK8sClusterCreateSchema = z
  .object({
    id: z.number().optional(),
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        "Cluster name cannot exceed 100 characters",
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
        "Location cannot exceed 50 characters",
      ),
  })
  .strict();

export const enhancedK8sClusterDeleteSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
  })
  .strict();

export const enhancedK8sClusterUpdateSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
    name: z
      .string()
      .trim()
      .min(CLUSTER_VALIDATION.name.minLength, "Cluster name cannot be empty")
      .max(
        CLUSTER_VALIDATION.name.maxLength,
        "Cluster name cannot exceed 100 characters",
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
        "Location cannot exceed 50 characters",
      )
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.location !== undefined,
    "At least one field (name or location) must be provided for update",
  );

export const enhancedStripeCreateSessionSchema = z
  .object({
    planId: z
      .string()
      .min(PLAN_VALIDATION.id.minLength, "Plan ID cannot be empty")
      .regex(/^price_/, "Plan ID must start with 'price_'"),
  })
  .strict();

export const enhancedUpdateUserNameSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER_VALIDATION.displayName.minLength, "Name cannot be empty")
      .max(
        USER_VALIDATION.displayName.maxLength,
        "Name cannot exceed 100 characters",
      ),
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const enhancedInsertCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();

export const enhancedQueryCustomerSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID format"),
  })
  .strict();
