/**
 * HTTP Status Codes Configuration
 *
 * This module provides a single source of truth for all HTTP status codes
 * used across the application, eliminating hardcoded status codes scattered
 * across the codebase.
 *
 * @module @saasfly/common/config/http
 * @example
 * ```ts
 * import { HTTP_STATUS } from "@saasfly/common";
 *
 * // Use in API responses
 * return NextResponse.json({ error: "Not found" }, { status: HTTP_STATUS.NOT_FOUND });
 *
 * // Use in error handling
 * if (response.status === HTTP_STATUS.UNAUTHORIZED) {
 *   // Handle unauthorized
 * }
 * ```
 */

/**
 * Standard HTTP status codes organized by category
 * All codes follow RFC 9110 (HTTP Semantics)
 */
export const HTTP_STATUS = {
  // 2xx Success
  /** 200 OK - Standard response for successful requests */
  OK: 200,
  /** 201 Created - Request succeeded and new resource created */
  CREATED: 201,
  /** 202 Accepted - Request accepted for processing but not completed */
  ACCEPTED: 202,
  /** 204 No Content - Request succeeded with no content to return */
  NO_CONTENT: 204,

  // 3xx Redirection
  /** 301 Moved Permanently - Resource permanently moved to new URL */
  MOVED_PERMANENTLY: 301,
  /** 302 Found - Resource temporarily moved to different URL */
  FOUND: 302,
  /** 304 Not Modified - Resource not modified since last request */
  NOT_MODIFIED: 304,
  /** 307 Temporary Redirect - Temporary redirect to different URL */
  TEMPORARY_REDIRECT: 307,
  /** 308 Permanent Redirect - Permanent redirect to different URL */
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  /** 400 Bad Request - Request syntax invalid or malformed */
  BAD_REQUEST: 400,
  /** 401 Unauthorized - Authentication required */
  UNAUTHORIZED: 401,
  /** 403 Forbidden - Server refuses to fulfill request */
  FORBIDDEN: 403,
  /** 404 Not Found - Resource not found */
  NOT_FOUND: 404,
  /** 405 Method Not Allowed - HTTP method not allowed for resource */
  METHOD_NOT_ALLOWED: 405,
  /** 409 Conflict - Request conflicts with current state */
  CONFLICT: 409,
  /** 410 Gone - Resource permanently deleted */
  GONE: 410,
  /** 422 Unprocessable Entity - Validation error */
  UNPROCESSABLE_ENTITY: 422,
  /** 429 Too Many Requests - Rate limit exceeded */
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  /** 500 Internal Server Error - Generic server error */
  INTERNAL_SERVER_ERROR: 500,
  /** 501 Not Implemented - Server doesn't support functionality */
  NOT_IMPLEMENTED: 501,
  /** 502 Bad Gateway - Invalid response from upstream server */
  BAD_GATEWAY: 502,
  /** 503 Service Unavailable - Server temporarily unavailable */
  SERVICE_UNAVAILABLE: 503,
  /** 504 Gateway Timeout - Upstream server timeout */
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP status code categories for type-safe grouping
 */
export const HTTP_STATUS_CATEGORIES = {
  SUCCESS: [200, 201, 202, 204] as const,
  REDIRECTION: [301, 302, 304, 307, 308] as const,
  CLIENT_ERROR: [400, 401, 403, 404, 405, 409, 410, 422, 429] as const,
  SERVER_ERROR: [500, 501, 502, 503, 504] as const,
} as const;

/**
 * Check if status code is a success (2xx)
 * @param status - HTTP status code to check
 * @returns True if status is 2xx
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if status code is a redirect (3xx)
 * @param status - HTTP status code to check
 * @returns True if status is 3xx
 */
export function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

/**
 * Check if status code is a client error (4xx)
 * @param status - HTTP status code to check
 * @returns True if status is 4xx
 */
export function isClientErrorStatus(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Check if status code is a server error (5xx)
 * @param status - HTTP status code to check
 * @returns True if status is 5xx
 */
export function isServerErrorStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

/**
 * Check if status code is an error (4xx or 5xx)
 * @param status - HTTP status code to check
 * @returns True if status is 4xx or 5xx
 */
export function isErrorStatus(status: number): boolean {
  return status >= 400 && status < 600;
}

/**
 * Get status code category name
 * @param status - HTTP status code
 * @returns Category name (SUCCESS, REDIRECTION, CLIENT_ERROR, SERVER_ERROR, or UNKNOWN)
 */
export function getStatusCategory(
  status: number,
): "SUCCESS" | "REDIRECTION" | "CLIENT_ERROR" | "SERVER_ERROR" | "UNKNOWN" {
  if (isSuccessStatus(status)) return "SUCCESS";
  if (isRedirectStatus(status)) return "REDIRECTION";
  if (isClientErrorStatus(status)) return "CLIENT_ERROR";
  if (isServerErrorStatus(status)) return "SERVER_ERROR";
  return "UNKNOWN";
}

/**
 * Common HTTP status code descriptions for logging/debugging
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  410: "Gone",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

/**
 * Get human-readable message for status code
 * @param status - HTTP status code
 * @returns Status message or "Unknown Status"
 */
export function getStatusMessage(status: number): string {
  return HTTP_STATUS_MESSAGES[status] ?? "Unknown Status";
}

/** Type for HTTP status code values */
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/** Default export for convenience */
export default HTTP_STATUS;
