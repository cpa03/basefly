/**
 * Content Security Policy (CSP) Configuration
 * 
 * This module provides environment-driven CSP configuration.
 * All CSP directives can be customized via environment variables.
 * 
 * @module ~/config/csp-config
 */

/**
 * Default CSP script sources
 */
const DEFAULT_SCRIPT_SRC = "'self' 'unsafe-inline' cdn.jsdelivr.net";

/**
 * Default CSP style sources
 */
const DEFAULT_STYLE_SRC = "'self' 'unsafe-inline' cdn.jsdelivr.net";

/**
 * Default CSP image sources
 */
const DEFAULT_IMG_SRC = "'self' blob: data: https://*.unsplash.com https://*.githubusercontent.com https://*.twil.lol https://*.twillot.com https://*.setupyourpay.com https://cdn.sanity.io https://*.twimg.com";

/**
 * Default CSP font sources
 */
const DEFAULT_FONT_SRC = "'self' data: cdn.jsdelivr.net";

/**
 * Default CSP connect sources
 */
const DEFAULT_CONNECT_SRC = "'self' https://*.clerk.accounts.dev https://*.stripe.com https://api.stripe.com https://*.posthog.com";

/**
 * Default CSP frame sources
 */
const DEFAULT_FRAME_SRC = "'self' https://js.stripe.com";

/**
 * CSP Configuration object
 * All values can be overridden via environment variables
 */
export const cspConfig = {
  /** Default CSP directives */
  directives: {
    "default-src": "'self'",
    "script-src": process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC ?? DEFAULT_SCRIPT_SRC,
    "style-src": process.env.NEXT_PUBLIC_CSP_STYLE_SRC ?? DEFAULT_STYLE_SRC,
    "img-src": process.env.NEXT_PUBLIC_CSP_IMG_SRC ?? DEFAULT_IMG_SRC,
    "font-src": DEFAULT_FONT_SRC,
    "connect-src": process.env.NEXT_PUBLIC_CSP_CONNECT_SRC ?? DEFAULT_CONNECT_SRC,
    "frame-src": DEFAULT_FRAME_SRC,
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self'",
    "frame-ancestors": "'none'",
    "block-all-mixed-content": "",
    "upgrade-insecure-requests": "",
  },
} as const;

/**
 * Generate CSP header string from configuration
 */
export function generateCSPHeader(): string {
  const directives = Object.entries(cspConfig.directives)
    .map(([key, value]) => {
      if (value === "") {
        return key;
      }
      return `${key} ${value}`;
    })
    .join("; ");
  
  return directives;
}

/**
 * Get formatted CSP header value (with whitespace normalized)
 */
export function getCSPHeaderValue(): string {
  return generateCSPHeader().replace(/\s{2,}/g, " ").trim();
}

/**
 * Type for CSP configuration
 */
export type CSPConfig = typeof cspConfig;
