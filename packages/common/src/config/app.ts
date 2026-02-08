/**
 * Centralized Application Configuration
 * 
 * This module provides a single source of truth for all application configuration.
 * All values are read from environment variables with sensible defaults.
 * 
 * Flexy Principle: No hardcoded values - everything is configurable!
 * 
 * @module @saasfly/common/config/app
 */

import { env } from "../env.mjs";

// ============================================================================
// Site & Branding Configuration
// ============================================================================

/**
 * Site branding configuration
 */
export const SITE_CONFIG = {
  /** Application name */
  name: env.NEXT_PUBLIC_APP_NAME ?? "Saasfly",
  
  /** Application description */
  description: env.NEXT_PUBLIC_APP_DESCRIPTION ?? "We provide an easier way to build saas service in production",
  
  /** Application URL */
  url: env.NEXT_PUBLIC_APP_URL ?? "https://github.com/saasfly/saasfly",
  
  /** OG Image URL */
  ogImage: env.NEXT_PUBLIC_APP_OG_IMAGE ?? "",
  
  /** GitHub repository configuration */
  github: {
    owner: env.NEXT_PUBLIC_GITHUB_OWNER ?? "saasfly",
    repo: env.NEXT_PUBLIC_GITHUB_REPO ?? "saasfly",
    url: env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/saasfly/saasfly",
    stars: env.NEXT_PUBLIC_GITHUB_STARS ?? null, // null = fetch dynamically
  },
  
  /** CLI installation commands */
  cli: {
    primary: env.NEXT_PUBLIC_CLI_PRIMARY_COMMAND ?? "bun create saasfly",
    alternatives: {
      npm: env.NEXT_PUBLIC_CLI_NPM_COMMAND ?? "npx create-saasfly",
      yarn: env.NEXT_PUBLIC_CLI_YARN_COMMAND ?? "yarn create saasfly",
      pnpm: env.NEXT_PUBLIC_CLI_PNPM_COMMAND ?? "pnpm create saasfly",
    },
  },
} as const;

// ============================================================================
// Internationalization Configuration
// ============================================================================

/**
 * Parse locales from environment variable
 * Format: comma-separated list (e.g., "en,zh,ko,ja")
 */
function parseLocales(): readonly string[] {
  const localesStr = env.NEXT_PUBLIC_LOCALES;
  if (localesStr) {
    return localesStr.split(",").map(l => l.trim()).filter(Boolean);
  }
  return ["en", "zh", "ko", "ja"] as const;
}

/**
 * i18n configuration
 */
export const I18N_CONFIG = {
  /** Default locale */
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "zh",
  
  /** Available locales */
  locales: parseLocales(),
  
  /** Locale display names */
  localeNames: {
    en: "English",
    zh: "中文",
    ko: "한국어",
    ja: "日本語",
  } as Record<string, string>,
} as const;

/** Type for valid locales */
export type Locale = (typeof I18N_CONFIG)["locales"][number];

// ============================================================================
// Security Configuration (CSP)
// ============================================================================

/**
 * Parse CSP domains from environment variable
 * Format: comma-separated list
 */
function parseCspDomains(envVar: string | undefined, defaults: string[]): string[] {
  if (envVar) {
    return envVar.split(",").map(d => d.trim()).filter(Boolean);
  }
  return defaults;
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  /** Default source */
  defaultSrc: ["'self'"],
  
  /** Script sources */
  scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
  
  /** Style sources */
  styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
  
  /** Image sources */
  imgSrc: [
    "'self'",
    "blob:",
    "data:",
    ...parseCspDomains(env.NEXT_PUBLIC_CSP_IMG_DOMAINS, [
      "https://*.unsplash.com",
      "https://*.githubusercontent.com",
      "https://*.twil.lol",
      "https://*.twillot.com",
      "https://*.setupyourpay.com",
      "https://cdn.sanity.io",
      "https://*.twimg.com",
    ]),
  ],
  
  /** Font sources */
  fontSrc: ["'self'", "data:", "cdn.jsdelivr.net"],
  
  /** Connect sources (APIs, WebSockets) */
  connectSrc: [
    "'self'",
    ...parseCspDomains(env.NEXT_PUBLIC_CSP_CONNECT_DOMAINS, [
      "https://*.clerk.accounts.dev",
      "https://*.stripe.com",
      "https://api.stripe.com",
      "https://*.posthog.com",
    ]),
  ],
  
  /** Frame sources */
  frameSrc: [
    "'self'",
    ...parseCspDomains(env.NEXT_PUBLIC_CSP_FRAME_DOMAINS, [
      "https://js.stripe.com",
    ]),
  ],
  
  /** Object sources */
  objectSrc: ["'none'"],
  
  /** Base URI */
  baseUri: ["'self'"],
  
  /** Form action */
  formAction: ["'self'"],
  
  /** Frame ancestors */
  frameAncestors: ["'none'"],
  
  /** Additional directives */
  additional: [
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ],
} as const;

/**
 * Build CSP header string from configuration
 */
export function buildCspHeader(): string {
  const directives = [
    `default-src ${CSP_CONFIG.defaultSrc.join(" ")}`,
    `script-src ${CSP_CONFIG.scriptSrc.join(" ")}`,
    `style-src ${CSP_CONFIG.styleSrc.join(" ")}`,
    `img-src ${CSP_CONFIG.imgSrc.join(" ")}`,
    `font-src ${CSP_CONFIG.fontSrc.join(" ")}`,
    `connect-src ${CSP_CONFIG.connectSrc.join(" ")}`,
    `frame-src ${CSP_CONFIG.frameSrc.join(" ")}`,
    `object-src ${CSP_CONFIG.objectSrc.join(" ")}`,
    `base-uri ${CSP_CONFIG.baseUri.join(" ")}`,
    `form-action ${CSP_CONFIG.formAction.join(" ")}`,
    `frame-ancestors ${CSP_CONFIG.frameAncestors.join(" ")}`,
    ...CSP_CONFIG.additional,
  ];
  
  return directives.join("; ");
}

// ============================================================================
// Kubernetes Configuration
// ============================================================================

/**
 * Parse cluster locations from environment variable
 * Format: comma-separated list
 */
function parseClusterLocations(): readonly string[] {
  const locationsStr = env.CLUSTER_LOCATIONS;
  if (locationsStr) {
    return locationsStr.split(",").map(l => l.trim()).filter(Boolean);
  }
  return ["China", "Hong Kong", "Singapore", "Tokyo", "US-West"] as const;
}

/**
 * Kubernetes configuration
 */
export const K8S_CONFIG = {
  /** Available cluster locations */
  locations: parseClusterLocations(),
  
  /** Default cluster location */
  defaultLocation: env.DEFAULT_CLUSTER_LOCATION ?? "Hong Kong",
  
  /** Cluster statuses */
  statuses: ["PENDING", "CREATING", "INITING", "RUNNING", "STOPPED", "DELETED"] as const,
  
  /** Default cluster configuration */
  defaults: {
    nodeCount: parseInt(env.K8S_DEFAULT_NODE_COUNT ?? "1", 10),
    nodeType: env.K8S_DEFAULT_NODE_TYPE ?? "standard",
    storageSize: parseInt(env.K8S_DEFAULT_STORAGE_SIZE ?? "20", 10),
    k8sVersion: env.K8S_DEFAULT_VERSION ?? "1.28",
    maxNameLength: parseInt(env.K8S_MAX_NAME_LENGTH ?? "100", 10),
  },
  
  /** Cluster tier limits */
  tierLimits: {
    FREE: parseInt(env.K8S_TIER_LIMIT_FREE ?? "1", 10),
    PRO: parseInt(env.K8S_TIER_LIMIT_PRO ?? "3", 10),
    BUSINESS: parseInt(env.K8S_TIER_LIMIT_BUSINESS ?? "10", 10),
  },
} as const;

/** Type for cluster locations */
export type ClusterLocation = (typeof K8S_CONFIG)["locations"][number];

/** Type for cluster statuses */
export type ClusterStatus = (typeof K8S_CONFIG)["statuses"][number];

// ============================================================================
// Pricing Configuration
// ============================================================================

/**
 * Pricing tier structure
 */
export interface PricingTier {
  monthly: number;
  yearly: number;
}

/**
 * Pricing tiers structure
 */
export interface PricingTiers {
  STARTER: PricingTier;
  PRO: PricingTier;
  BUSINESS: PricingTier;
}

/**
 * Parse pricing from environment variable
 * Format: JSON string or individual env vars
 */
function parsePricing(): PricingTiers {
  // Try to parse from JSON env var first
  const pricingJson = env.PRICING_TIERS_JSON;
  if (pricingJson) {
    try {
      const parsed = JSON.parse(pricingJson) as PricingTiers;
      return parsed;
    } catch {
      console.warn("Failed to parse PRICING_TIERS_JSON, using defaults");
    }
  }
  
  // Fall back to individual env vars
  return {
    STARTER: {
      monthly: parseInt(env.PRICING_STARTER_MONTHLY ?? "0", 10),
      yearly: parseInt(env.PRICING_STARTER_YEARLY ?? "0", 10),
    },
    PRO: {
      monthly: parseInt(env.PRICING_PRO_MONTHLY ?? "15", 10),
      yearly: parseInt(env.PRICING_PRO_YEARLY ?? "144", 10),
    },
    BUSINESS: {
      monthly: parseInt(env.PRICING_BUSINESS_MONTHLY ?? "30", 10),
      yearly: parseInt(env.PRICING_BUSINESS_YEARLY ?? "300", 10),
    },
  };
}

/**
 * Resource limit structure
 */
export interface ResourceLimit {
  posts: number;
  clusters: number;
}

/**
 * Resource limits structure
 */
export interface ResourceLimits {
  STARTER: ResourceLimit;
  PRO: ResourceLimit;
  BUSINESS: ResourceLimit;
}

/**
 * Cluster limits structure
 */
export interface ClusterLimits {
  STARTER: number;
  PRO: number;
  BUSINESS: number;
}

/**
 * Pricing configuration
 */
export const PRICING_CONFIG: {
  tiers: PricingTiers;
  clusterLimits: ClusterLimits;
  resourceLimits: ResourceLimits;
  planIds: Record<string, string>;
  currency: string;
} = {
  tiers: parsePricing(),
  
  clusterLimits: {
    STARTER: parseInt(env.CLUSTER_LIMIT_STARTER ?? "1", 10),
    PRO: parseInt(env.CLUSTER_LIMIT_PRO ?? "3", 10),
    BUSINESS: parseInt(env.CLUSTER_LIMIT_BUSINESS ?? "10", 10),
  },
  
  resourceLimits: {
    STARTER: {
      posts: parseInt(env.RESOURCE_LIMIT_STARTER_POSTS ?? "100", 10),
      clusters: parseInt(env.CLUSTER_LIMIT_STARTER ?? "1", 10),
    },
    PRO: {
      posts: parseInt(env.RESOURCE_LIMIT_PRO_POSTS ?? "500", 10),
      clusters: parseInt(env.CLUSTER_LIMIT_PRO ?? "3", 10),
    },
    BUSINESS: {
      posts: Infinity,
      clusters: parseInt(env.CLUSTER_LIMIT_BUSINESS ?? "10", 10),
    },
  },
  
  planIds: {
    STARTER: "starter",
    PRO: "pro",
    BUSINESS: "business",
  } as const,
  
  currency: env.PRICING_CURRENCY ?? "USD",
} as const;

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

export { SITE_CONFIG as siteConfig };
export { I18N_CONFIG as i18n };
export { CSP_CONFIG as cspConfig };
export { K8S_CONFIG as k8sConfig };
export { PRICING_CONFIG as pricingConfig };
