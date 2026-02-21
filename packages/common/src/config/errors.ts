/**
 * Error Messages Configuration
 *
 * Centralized error messages to eliminate hardcoded error strings
 * scattered across the codebase. This ensures consistency in error handling
 * and makes error messages easier to maintain and localize.
 *
 * @module @saasfly/common/config/errors
 */

/**
 * Generic error messages used across the application
 */
export const ERROR_MESSAGES = {
  /** Generic unexpected error */
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  /** Generic something went wrong */
  SOMETHING_WENT_WRONG: "Something went wrong.",
  /** Operation failed */
  OPERATION_FAILED: "Operation failed. Please try again.",
  /** Resource not found */
  NOT_FOUND: "The requested resource was not found.",
  /** Unauthorized access */
  UNAUTHORIZED: "You are not authorized to perform this action.",
  /** Validation error */
  VALIDATION_ERROR: "Validation failed. Please check your input.",
  /** Network error */
  NETWORK_ERROR: "A network error occurred. Please check your connection.",
  /** Timeout error */
  TIMEOUT_ERROR: "The request timed out. Please try again.",
  /** Service unavailable */
  SERVICE_UNAVAILABLE: "Service temporarily unavailable due to failures.",
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later.",
} as const;

/**
 * Pattern/Background generation error messages
 */
export const PATTERN_ERRORS = {
  /** Failed to pick a pattern */
  PATTERN_SELECTION_FAILED: "Something went wrong trying to pick a pattern...",
  /** Failed to generate background */
  BACKGROUND_GENERATION_FAILED: "Failed to generate background pattern.",
} as const;

/**
 * Cluster operation error messages
 */
export const CLUSTER_ERRORS = {
  /** Cluster creation failed */
  CREATE_FAILED: "Your cluster was not created. Please try again.",
  /** Cluster deletion failed */
  DELETE_FAILED: "Your cluster was not deleted. Please try again.",
  /** Cluster update failed */
  UPDATE_FAILED: "Your cluster was not updated. Please try again.",
  /** Cluster not found */
  NOT_FOUND: "Cluster not found.",
  /** Invalid cluster configuration */
  INVALID_CONFIG: "Invalid cluster configuration.",
  /** Access forbidden - user doesn't have permission */
  FORBIDDEN: "You don't have access to this cluster.",
  /** Invalid input data */
  INVALID_INPUT: "Invalid input data.",
} as const;

/**
 * User operation error messages
 */
export const USER_ERRORS = {
  /** User not found */
  NOT_FOUND: "User not found.",
  /** Update failed */
  UPDATE_FAILED: "Failed to update user. Please try again.",
  /** Invalid user data */
  INVALID_DATA: "Invalid user data provided.",
} as const;

/**
 * Auth error messages
 */
export const AUTH_ERRORS = {
  /** Admin access required */
  ADMIN_ACCESS_REQUIRED: "Admin access required",
  /** Not authenticated */
  NOT_AUTHENTICATED: "You must be signed in to access this resource.",
  /** Session expired */
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
} as const;

/**
 * Environment variable error messages
 */
export const ENV_ERRORS = {
  /** NEXT_PUBLIC_APP_URL not defined */
  APP_URL_NOT_DEFINED:
    "NEXT_PUBLIC_APP_URL is not defined. Please set it in your environment variables.",
  /** Generic env var missing */
  ENV_VAR_MISSING: "Required environment variable is not defined.",
} as const;

/**
 * Toast notification default messages
 */
export const TOAST_MESSAGES = {
  /** Copy success */
  COPY_SUCCESS: {
    title: "Copied!",
    description: "Copied to clipboard.",
  },
  /** Copy error */
  COPY_ERROR: {
    title: "Copy Failed",
    description: "Could not copy to clipboard.",
  },
  /** Save success */
  SAVE_SUCCESS: {
    title: "Saved!",
    description: "Your changes have been saved.",
  },
  /** Save error */
  SAVE_ERROR: {
    title: "Save Failed",
    description: "Could not save your changes.",
  },
  /** Delete success */
  DELETE_SUCCESS: {
    title: "Deleted!",
    description: "Item has been deleted.",
  },
} as const;

/**
 * Complete error configuration export
 */
export const ERRORS = {
  generic: ERROR_MESSAGES,
  pattern: PATTERN_ERRORS,
  cluster: CLUSTER_ERRORS,
  user: USER_ERRORS,
  auth: AUTH_ERRORS,
  env: ENV_ERRORS,
  toast: TOAST_MESSAGES,
} as const;

// Type exports for TypeScript support
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export type PatternErrorKey = keyof typeof PATTERN_ERRORS;
export type ClusterErrorKey = keyof typeof CLUSTER_ERRORS;
export type UserErrorKey = keyof typeof USER_ERRORS;
export type AuthErrorKey = keyof typeof AUTH_ERRORS;
export type EnvErrorKey = keyof typeof ENV_ERRORS;
export type ToastMessageKey = keyof typeof TOAST_MESSAGES;
export type ErrorsConfig = typeof ERRORS;
