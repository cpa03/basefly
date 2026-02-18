/**
 * Validation Constants
 *
 * Centralized validation constraints to eliminate hardcoded values
 * across the application. This ensures consistency in form validations,
 * API input limits, and data constraints.
 *
 * @module @saasfly/common/config/validation
 */

/**
 * User-related validation constraints
 */
export const USER_VALIDATION = {
  /** Username constraints */
  username: {
    minLength: 3,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_-]+$/,
    patternMessage:
      "Username can only contain letters, numbers, underscores, and hyphens",
  },
  /** Display name constraints */
  displayName: {
    minLength: 1,
    maxLength: 100,
  },
  /** Email constraints */
  email: {
    maxLength: 255,
  },
  /** Password constraints */
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
  },
  /** Bio/description constraints */
  bio: {
    maxLength: 500,
  },
} as const;

/**
 * Cluster-related validation constraints
 */
export const CLUSTER_VALIDATION = {
  /** Cluster name constraints */
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/,
    patternMessage:
      "Cluster name can only contain lowercase letters, numbers, and hyphens",
  },
  /** Cluster display name constraints */
  displayName: {
    minLength: 2,
    maxLength: 32,
  },
  /** Location/region constraints */
  location: {
    minLength: 1,
    maxLength: 50,
  },
  /** Description constraints */
  description: {
    maxLength: 500,
  },
  /** Tags constraints */
  tags: {
    maxCount: 10,
    maxLength: 50,
  },
} as const;

/**
 * Organization-related validation constraints
 */
export const ORG_VALIDATION = {
  /** Organization name constraints */
  name: {
    minLength: 1,
    maxLength: 100,
  },
  /** Organization slug constraints */
  slug: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-z0-9-]+$/,
  },
} as const;

/**
 * Plan/Subscription-related validation constraints
 */
export const PLAN_VALIDATION = {
  /** Plan ID constraints */
  id: {
    minLength: 1,
    maxLength: 50,
  },
  /** Plan name constraints */
  name: {
    minLength: 1,
    maxLength: 100,
  },
} as const;

/**
 * API/Input-related validation constraints
 */
export const API_VALIDATION = {
  /** General text input */
  text: {
    minLength: 1,
    maxLength: 1000,
  },
  /** Long text (descriptions, comments) */
  longText: {
    maxLength: 10000,
  },
  /** Search query */
  search: {
    minLength: 2,
    maxLength: 200,
  },
  /** ID constraints */
  id: {
    minLength: 1,
    maxLength: 100,
  },
} as const;

/**
 * Pagination and list validation constraints
 */
export const PAGINATION_VALIDATION = {
  /** Page number constraints */
  page: {
    min: 1,
    max: 10000,
  },
  /** Page size constraints */
  pageSize: {
    min: 1,
    max: 100,
  },
} as const;

/**
 * Complete validation configuration export
 */
export const VALIDATION = {
  user: USER_VALIDATION,
  cluster: CLUSTER_VALIDATION,
  organization: ORG_VALIDATION,
  plan: PLAN_VALIDATION,
  api: API_VALIDATION,
  pagination: PAGINATION_VALIDATION,
} as const;

// Type exports for TypeScript support
export type UserValidation = typeof USER_VALIDATION;
export type ClusterValidation = typeof CLUSTER_VALIDATION;
export type OrganizationValidation = typeof ORG_VALIDATION;
export type PlanValidation = typeof PLAN_VALIDATION;
export type ApiValidation = typeof API_VALIDATION;
export type PaginationValidation = typeof PAGINATION_VALIDATION;
export type ValidationConfig = typeof VALIDATION;
