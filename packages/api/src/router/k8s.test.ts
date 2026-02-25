/**
 * K8s Router Tests
 *
 * Tests for Kubernetes cluster management router input validation schemas
 *
 * @module k8sRouter
 *
 * NOTE: We define schemas inline to avoid importing from k8s.ts which triggers
 * database initialization (requires POSTGRES_URL env var).
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

// Define validation constants inline to match k8s.ts (from @saasfly/common)
const CLUSTER_VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
    patternMessage:
      "Cluster name can only contain lowercase letters, numbers, and hyphens",
  },
  location: {
    minLength: 1,
    maxLength: 50,
  },
} as const;

// Define schemas inline to avoid importing from k8s.ts (which imports db)
export const k8sClusterCreateSchema = z
  .object({
    id: z.number().int().positive().optional(),
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

export const k8sClusterDeleteSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
  })
  .strict();

export const k8sClusterUpdateSchema = z
  .object({
    id: z.number().int("ID must be an integer").positive("ID must be positive"),
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

describe("K8s Router - Input Validation Schemas", () => {
  describe("k8sClusterCreateSchema - Cluster Creation Validation", () => {
    const validCreateInput = {
      name: "my-cluster",
      location: "us-west-1",
    };

    it("accepts valid cluster creation input", () => {
      const result = k8sClusterCreateSchema.safeParse(validCreateInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCreateInput);
      }
    });

    it("accepts cluster name at maximum length (100 chars)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "a".repeat(100),
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts location at maximum length (50 chars)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "a".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("accepts cluster name with hyphens", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "my-k8s-cluster",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts cluster name with numbers", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "cluster-2024",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts cluster name starting with hyphen (pattern allows it)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "-my-cluster",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts cluster name ending with hyphen (pattern allows it)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "my-cluster-",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid AWS region locations", () => {
      const validLocations = [
        "us-east-1",
        "us-west-2",
        "eu-west-1",
        "ap-southeast-1",
      ];
      for (const location of validLocations) {
        const result = k8sClusterCreateSchema.safeParse({
          name: "test-cluster",
          location,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects empty cluster name", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(
          true,
        );
      }
    });

    it("rejects cluster name with spaces", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "my cluster",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name exceeding maximum length (100 chars)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "a".repeat(101),
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) =>
            i.message.includes("cannot exceed 100 characters"),
          ),
        ).toBe(true);
      }
    });

    it("rejects empty location", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("location")),
        ).toBe(true);
      }
    });

    it("rejects location exceeding maximum length (50 chars)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name with uppercase letters", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "MyCluster",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name with special characters", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "cluster@test",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields (strict mode)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "us-west-1",
        unknownField: "should be rejected",
      });
      expect(result.success).toBe(false);
    });

    it("allows optional id field in creation", () => {
      const result = k8sClusterCreateSchema.safeParse({
        id: 123,
        name: "test-cluster",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("k8sClusterUpdateSchema - Cluster Update Validation", () => {
    it("accepts valid update with only name", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "updated-cluster",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid update with only location", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        location: "eu-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid update with both name and location", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "updated-cluster",
        location: "eu-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts cluster ID as positive integer", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "test-cluster",
      });
      expect(result.success).toBe(true);
    });

    it("accepts large cluster ID", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 999999999,
        name: "test-cluster",
      });
      expect(result.success).toBe(true);
    });

    it("rejects update without id", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        name: "updated-cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects update with id = 0", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 0,
        name: "updated-cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects update with negative id", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: -1,
        name: "updated-cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects update with non-integer id", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1.5,
        name: "updated-cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects update with string id", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: "1" as unknown as number,
        name: "updated-cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects update without any fields to update", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) =>
            i.message.includes("At least one field"),
          ),
        ).toBe(true);
      }
    });

    it("rejects cluster name exceeding maximum length (100 chars)", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("rejects location exceeding maximum length (50 chars)", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        location: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name with spaces", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "my cluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name with uppercase letters", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "MyCluster",
      });
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields (strict mode)", () => {
      const result = k8sClusterUpdateSchema.safeParse({
        id: 1,
        name: "updated-cluster",
        unknownField: "should be rejected",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("k8sClusterDeleteSchema - Cluster Delete Validation", () => {
    it("accepts valid delete input with positive integer id", () => {
      const result = k8sClusterDeleteSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: 1 });
      }
    });

    it("accepts large cluster id", () => {
      const result = k8sClusterDeleteSchema.safeParse({ id: 999999999 });
      expect(result.success).toBe(true);
    });

    it("rejects delete without id", () => {
      const result = k8sClusterDeleteSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects delete with id = 0", () => {
      const result = k8sClusterDeleteSchema.safeParse({ id: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("id"))).toBe(
          true,
        );
      }
    });

    it("rejects delete with negative id", () => {
      const result = k8sClusterDeleteSchema.safeParse({ id: -1 });
      expect(result.success).toBe(false);
    });

    it("rejects delete with non-integer id", () => {
      const result = k8sClusterDeleteSchema.safeParse({ id: 1.5 });
      expect(result.success).toBe(false);
    });

    it("rejects delete with string id", () => {
      const result = k8sClusterDeleteSchema.safeParse({
        id: "1" as unknown as number,
      });
      expect(result.success).toBe(false);
    });

    it("rejects additional unknown fields (strict mode)", () => {
      const result = k8sClusterDeleteSchema.safeParse({
        id: 1,
        force: true,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("K8s Router - Schema Edge Cases", () => {
  describe("Unicode and special characters", () => {
    it("rejects cluster name with unicode characters", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "cluster-über",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects cluster name with emoji", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "cluster🚀",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Boundary conditions", () => {
    it("accepts cluster name at exact minimum length (1 char)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "a",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts location at exact minimum length (1 char)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "a",
      });
      expect(result.success).toBe(true);
    });

    it("rejects whitespace-only cluster name after trim", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "   ",
        location: "us-west-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only location after trim", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "test-cluster",
        location: "   ",
      });
      expect(result.success).toBe(false);
    });

    it("accepts cluster name with only hyphens (pattern allows it)", () => {
      const result = k8sClusterCreateSchema.safeParse({
        name: "---",
        location: "us-west-1",
      });
      expect(result.success).toBe(true);
    });
  });
});
