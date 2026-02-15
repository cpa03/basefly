/**
 * Content Security Policy (CSP) Configuration
 *
 * This module provides a centralized, modular configuration for CSP headers,
 * eliminating hardcoded security policies scattered across the codebase.
 *
 * @module @saasfly/common/config/csp
 */

/**
 * External service domains used in CSP directives
 * Centralized for easy maintenance and updates
 */
export const CSP_DOMAINS = {
  /** Script sources */
  scripts: {
    /** CDN for scripts */
    cdn: "cdn.jsdelivr.net",
    /** Vercel analytics scripts */
    vercel: "https://va.vercel-scripts.com",
  },
  /** Image sources */
  images: {
    /** Unsplash image CDN */
    unsplash: "https://*.unsplash.com",
    /** GitHub user content */
    github: "https://*.githubusercontent.com",
    /** Twillot CDN */
    twillot: "https://*.twil.lol",
    /** Twillot domain */
    twillotMain: "https://*.twillot.com",
    /** SetupYourPay domain */
    setupyourpay: "https://*.setupyourpay.com",
    /** Sanity CDN */
    sanity: "https://cdn.sanity.io",
    /** Twitter images */
    twitter: "https://*.twimg.com",
  },
  /** Font sources */
  fonts: {
    /** CDN for fonts */
    cdn: "cdn.jsdelivr.net",
  },
  /** Connect sources (APIs, WebSockets) */
  connect: {
    /** Clerk authentication */
    clerk: "https://*.clerk.accounts.dev",
    /** Stripe API */
    stripe: "https://*.stripe.com",
    /** Stripe main API */
    stripeApi: "https://api.stripe.com",
    /** PostHog analytics */
    posthog: "https://*.posthog.com",
    /** Local WebSocket for development */
    localWs: "ws://localhost:12882/",
  },
  /** Frame sources (iframes) */
  frames: {
    /** Stripe checkout */
    stripe: "https://js.stripe.com",
  },
} as const;

/**
 * CSP directive builders
 * Functions to generate CSP directive values from domain configs
 */
export const CSP_DIRECTIVES = {
  /** Default source policy */
  defaultSrc: ["'self'"],

  /** Script source policy */
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    CSP_DOMAINS.scripts.cdn,
    CSP_DOMAINS.scripts.vercel,
  ],

  /** Style source policy */
  styleSrc: ["'self'", "'unsafe-inline'", CSP_DOMAINS.fonts.cdn],

  /** Image source policy */
  imgSrc: [
    "'self'",
    "blob:",
    "data:",
    CSP_DOMAINS.images.unsplash,
    CSP_DOMAINS.images.github,
    CSP_DOMAINS.images.twillot,
    CSP_DOMAINS.images.twillotMain,
    CSP_DOMAINS.images.setupyourpay,
    CSP_DOMAINS.images.sanity,
    CSP_DOMAINS.images.twitter,
  ],

  /** Font source policy */
  fontSrc: ["'self'", "data:", CSP_DOMAINS.fonts.cdn],

  /** Connect source policy */
  connectSrc: [
    "'self'",
    CSP_DOMAINS.connect.clerk,
    CSP_DOMAINS.connect.stripe,
    CSP_DOMAINS.connect.stripeApi,
    CSP_DOMAINS.connect.posthog,
    CSP_DOMAINS.connect.localWs,
  ],

  /** Frame source policy */
  frameSrc: ["'self'", CSP_DOMAINS.frames.stripe],

  /** Object source policy (Flash, etc.) */
  objectSrc: ["'none'"],

  /** Base URI restriction */
  baseUri: ["'self'"],

  /** Form action restriction */
  formAction: ["'self'"],

  /** Frame ancestors (clickjacking protection) */
  frameAncestors: ["'none'"],
} as const;

/**
 * Additional security headers
 */
export const SECURITY_HEADERS = {
  /** Block mixed content (HTTP on HTTPS pages) */
  blockAllMixedContent: "block-all-mixed-content",
  /** Upgrade insecure requests to HTTPS */
  upgradeInsecureRequests: "upgrade-insecure-requests",
} as const;

/**
 * Build CSP header string from directives
 * @returns Formatted CSP header string
 */
export function buildCSPHeader(): string {
  const directives = [
    `default-src ${CSP_DIRECTIVES.defaultSrc.join(" ")}`,
    `script-src ${CSP_DIRECTIVES.scriptSrc.join(" ")}`,
    `style-src ${CSP_DIRECTIVES.styleSrc.join(" ")}`,
    `img-src ${CSP_DIRECTIVES.imgSrc.join(" ")}`,
    `font-src ${CSP_DIRECTIVES.fontSrc.join(" ")}`,
    `connect-src ${CSP_DIRECTIVES.connectSrc.join(" ")}`,
    `frame-src ${CSP_DIRECTIVES.frameSrc.join(" ")}`,
    `object-src ${CSP_DIRECTIVES.objectSrc.join(" ")}`,
    `base-uri ${CSP_DIRECTIVES.baseUri.join(" ")}`,
    `form-action ${CSP_DIRECTIVES.formAction.join(" ")}`,
    `frame-ancestors ${CSP_DIRECTIVES.frameAncestors.join(" ")}`,
    SECURITY_HEADERS.blockAllMixedContent,
    SECURITY_HEADERS.upgradeInsecureRequests,
  ];

  return directives.join("; ");
}

/**
 * Get minified CSP header (for production)
 * Removes extra whitespace
 * @returns Minified CSP header string
 */
export function getMinifiedCSPHeader(): string {
  return buildCSPHeader()
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * CSP configuration object
 * Export all CSP-related configuration in one object
 */
export const CSP_CONFIG = {
  domains: CSP_DOMAINS,
  directives: CSP_DIRECTIVES,
  headers: SECURITY_HEADERS,
  buildHeader: buildCSPHeader,
  getMinifiedHeader: getMinifiedCSPHeader,
} as const;

/** Default export for convenience */
export default CSP_CONFIG;
