/**
 * Request ID Utility for Distributed Tracing
 * 
 * Provides functionality to generate, validate, and manage request IDs
 * across the application for distributed tracing and observability.
 * 
 * @example
 * ```ts
 * import { generateRequestId, extractRequestId } from "@saasfly/api/request-id";
 * 
 * // Generate a new request ID
 * const requestId = generateRequestId(); // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 * 
 * // Extract from headers
 * const headers = new Headers({ "X-Request-ID": "existing-id" });
 * const extracted = extractRequestId(headers); // "existing-id"
 * ```
 */

/**
 * Standard header name for request IDs
 */
export const REQUEST_ID_HEADER = "X-Request-ID";

/**
 * Regular expression for validating UUID v4 format
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generates a new unique request ID using UUID v4 format
 * 
 * Uses crypto.randomUUID() which is available in Node.js 15.6.0+
 * Fallback implementation for older versions uses a custom approach.
 * 
 * @returns A new UUID v4 formatted request ID
 */
export function generateRequestId(): string {
  // Use built-in crypto.randomUUID() if available (Node.js 15.6.0+, modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return generateUUIDv4Fallback();
}

/**
 * Fallback UUID v4 generator for older Node.js versions
 * 
 * @private
 */
function generateUUIDv4Fallback(): string {
  // Generate 16 random bytes
  const bytes = new Uint8Array(16);
  
  // Use crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback to Math.random() for older browsers
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Set version bits (4) and variant bits (8, 9, A, or B)
  bytes[6]! = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8]! = (bytes[8]! & 0x3f) | 0x80; // Variant 1

  // Convert to hex string with dashes (ES5 compatible approach)
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i]!.toString(16).padStart(2, '0'));
  }
  const hexStr = hex.join('');

  return [
    hexStr.substring(0, 8),
    hexStr.substring(8, 12),
    hexStr.substring(12, 16),
    hexStr.substring(16, 20),
    hexStr.substring(20, 32),
  ].join('-');
}

/**
 * Extracts request ID from HTTP headers
 * 
 * Looks for the X-Request-ID header and validates the format.
 * Returns null if header is missing or invalid.
 * 
 * @param headers - HTTP headers object
 * @returns The extracted request ID or null
 */
export function extractRequestId(headers: Headers): string | null {
  const requestId = headers.get(REQUEST_ID_HEADER);

  if (!requestId) {
    return null;
  }

  if (!isValidRequestId(requestId)) {
    return null;
  }

  return requestId;
}

/**
 * Extracts or generates a request ID from headers
 * 
 * If a valid request ID exists in headers, returns it.
 * Otherwise, generates and returns a new request ID.
 * 
 * @param headers - HTTP headers object
 * @returns The extracted request ID or a newly generated one
 */
export function getOrGenerateRequestId(headers: Headers): string {
  const existing = extractRequestId(headers);
  return existing || generateRequestId();
}

/**
 * Validates if a string is a properly formatted request ID
 * 
 * Checks if the string matches UUID v4 format.
 * 
 * @param requestId - The request ID to validate
 * @returns True if the request ID is valid
 */
export function isValidRequestId(requestId: string): boolean {
  return UUID_V4_REGEX.test(requestId);
}

/**
 * Creates a request ID context object for logging
 * 
 * Returns an object with the request ID that can be spread into log metadata.
 * 
 * @param requestId - The request ID
 * @returns A context object with the request ID
 */
export function createRequestContext(requestId: string): { requestId: string } {
  if (!isValidRequestId(requestId)) {
    throw new Error(`Invalid request ID: ${requestId}`);
  }

  return { requestId };
}
