/**
 * HTTP Header Names Configuration
 *
 * This module provides a single source of truth for all HTTP header names
 * used across the application, eliminating hardcoded header strings scattered
 * across the codebase.
 *
 * Following RFC 9110 (HTTP Semantics) and common conventions
 *
 * @module @saasfly/common/config/headers
 * @example
 * ```ts
 * import { HEADERS } from "@saasfly/common";
 *
 * // Use in fetch requests
 * headers: { [HEADERS.CONTENT_TYPE]: "application/json" }
 *
 * // Use in tRPC
 * headers: { [HEADERS.X_TRPC_SOURCE]: "client" }
 * ```
 */

/**
 * Standard HTTP headers (RFC 9110)
 */
export const STANDARD_HEADERS = {
  // Request/Response headers
  /** Content-Type - Indicates media type of the resource */
  CONTENT_TYPE: "Content-Type",
  /** Content-Length - Size of the response body in bytes */
  CONTENT_LENGTH: "Content-Length",
  /** Authorization - Credentials for authenticating the client */
  AUTHORIZATION: "Authorization",
  /** Accept - Media types the client will accept */
  ACCEPT: "Accept",
  /** Accept-Encoding - Encoding algorithms the client understands */
  ACCEPT_ENCODING: "Accept-Encoding",
  /** Accept-Language - Languages the client prefers */
  ACCEPT_LANGUAGE: "Accept-Language",
  /** Cache-Control - Directives for caching mechanisms */
  CACHE_CONTROL: "Cache-Control",
  /** Connection - Controls whether connection stays open */
  CONNECTION: "Connection",
  /** Cookie - HTTP cookies previously sent by server */
  COOKIE: "Cookie",
  /** Set-Cookie - Sends cookies from server to client */
  SET_COOKIE: "Set-Cookie",

  // CORS headers
  /** Access-Control-Allow-Origin - Allowed origins for CORS */
  ACCESS_CONTROL_ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  /** Access-Control-Allow-Methods - Allowed HTTP methods for CORS */
  ACCESS_CONTROL_ALLOW_METHODS: "Access-Control-Allow-Methods",
  /** Access-Control-Allow-Headers - Allowed headers for CORS */
  ACCESS_CONTROL_ALLOW_HEADERS: "Access-Control-Allow-Headers",
  /** Access-Control-Request-Headers - Headers client wants to use */
  ACCESS_CONTROL_REQUEST_HEADERS: "Access-Control-Request-Headers",
  /** Origin - Origin of the request */
  ORIGIN: "Origin",

  // Security headers
  /** X-Content-Type-Options - Prevents MIME type sniffing */
  X_CONTENT_TYPE_OPTIONS: "X-Content-Type-Options",
  /** X-Frame-Options - Controls frame embedding */
  X_FRAME_OPTIONS: "X-Frame-Options",
  /** X-XSS-Protection - Legacy XSS filter control */
  X_XSS_PROTECTION: "X-XSS-Protection",
  /** Strict-Transport-Security - Enforces HTTPS */
  STRICT_TRANSPORT_SECURITY: "Strict-Transport-Security",
  /** Referrer-Policy - Controls referrer information */
  REFERRER_POLICY: "Referrer-Policy",
  /** Permissions-Policy - Controls browser features */
  PERMISSIONS_POLICY: "Permissions-Policy",
  /** Content-Security-Policy - CSP directives */
  CONTENT_SECURITY_POLICY: "Content-Security-Policy",
} as const;

/**
 * Application-specific custom headers
 * These are non-standard headers used internally by the application
 */
export const CUSTOM_HEADERS = {
  // tRPC headers
  /** X-TRPC-Source - Identifies the source of tRPC requests (client, rsc, server) */
  X_TRPC_SOURCE: "x-trpc-source",

  // Request tracking
  /** X-Request-ID - Unique identifier for request tracing */
  X_REQUEST_ID: "X-Request-ID",
  /** X-Correlation-ID - ID to correlate requests across services */
  X_CORRELATION_ID: "X-Correlation-ID",

  // Client info
  /** X-Forwarded-For - Original client IP when behind proxy */
  X_FORWARDED_FOR: "X-Forwarded-For",
  /** X-Forwarded-Proto - Original protocol (http/https) */
  X_FORWARDED_PROTO: "X-Forwarded-Proto",
  /** X-Real-IP - Actual client IP address */
  X_REAL_IP: "X-Real-IP",

  // API versioning
  /** X-API-Version - API version being used */
  X_API_VERSION: "X-API-Version",

  // Application metadata
  /** X-App-Version - Application version */
  X_APP_VERSION: "X-App-Version",
  /** X-Environment - Deployment environment */
  X_ENVIRONMENT: "X-Environment",
} as const;

/**
 * tRPC-specific header values for X-TRPC-Source
 */
export const TRPC_SOURCE_VALUES = {
  /** Request originated from client-side JavaScript */
  CLIENT: "client",
  /** Request originated from React Server Component */
  RSC: "rsc",
  /** Request originated from server-side code */
  SERVER: "server",
  /** Request originated from edge runtime */
  EDGE: "edge",
} as const;

/**
 * Content type header values
 */
export const CONTENT_TYPES = {
  /** application/json */
  JSON: "application/json",
  /** text/html */
  HTML: "text/html",
  /** text/plain */
  TEXT: "text/plain",
  /** application/xml */
  XML: "application/xml",
  /** application/x-www-form-urlencoded */
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  /** multipart/form-data */
  MULTIPART_FORM_DATA: "multipart/form-data",
  /** application/octet-stream */
  BINARY: "application/octet-stream",
  /** image/* wildcard */
  IMAGE: "image/*",
} as const;

/**
 * Combined headers export - includes standard and custom headers
 */
export const HEADERS = {
  ...STANDARD_HEADERS,
  ...CUSTOM_HEADERS,
} as const;

/**
 * Type for standard header names
 */
export type StandardHeader = (typeof STANDARD_HEADERS)[keyof typeof STANDARD_HEADERS];

/**
 * Type for custom header names
 */
export type CustomHeader = (typeof CUSTOM_HEADERS)[keyof typeof CUSTOM_HEADERS];

/**
 * Type for all header names
 */
export type HeaderName = (typeof HEADERS)[keyof typeof HEADERS];

/**
 * Type for tRPC source values
 */
export type TrpcSourceValue = (typeof TRPC_SOURCE_VALUES)[keyof typeof TRPC_SOURCE_VALUES];

/**
 * Type for content type values
 */
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

/** Default export for convenience */
export default HEADERS;
