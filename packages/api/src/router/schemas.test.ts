import { z } from "zod";

export const enhancedK8sClusterCreateSchema = z
  .object({
    id: z.number().optional(),
    name: z
      .string()
      .min(1, "Cluster name cannot be empty")
      .max(100, "Cluster name cannot exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9-]+$/,
        "Cluster name can only contain letters, numbers, and hyphens",
      )
      .transform((val) => val.trim()),
    location: z
      .string()
      .min(1, "Location cannot be empty")
      .max(50, "Location cannot exceed 50 characters")
      .transform((val) => val.trim()),
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
      .min(1, "Cluster name cannot be empty")
      .max(100, "Cluster name cannot exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9-]+$/,
        "Cluster name can only contain letters, numbers, and hyphens",
      )
      .trim()
      .optional(),
    location: z
      .string()
      .min(1, "Location cannot be empty")
      .max(50, "Location cannot exceed 50 characters")
      .trim()
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.location !== undefined,
    "At least one field (name or location) must be provided for update",
  )
  // @ts-expect-error - .strict() method compatibility with Zod version
  .strict();

export const enhancedStripeCreateSessionSchema = z
  .object({
    planId: z
      .string()
      .min(1, "Plan ID cannot be empty")
      .regex(/^price_/, "Plan ID must start with 'price_'"),
  })
  .strict();

export const enhancedUpdateUserNameSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters")
      .transform((val) => val.trim()),
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
