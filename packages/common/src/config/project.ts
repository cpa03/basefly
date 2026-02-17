/**
 * Project Configuration
 *
 * This is the ROOT configuration file for the entire application.
 * All brand, company, and project-level settings should be defined here.
 *
 * This eliminates hardcoded brand values scattered across the codebase.
 *
 * @module @saasfly/common/config/project
 *
 * @example
 * ```ts
 * import { PROJECT_CONFIG } from "@saasfly/common";
 *
 * // Use brand name
 * console.log(PROJECT_CONFIG.brand.name); // "Basefly"
 *
 * // Use company info
 * console.log(PROJECT_CONFIG.company.name); // "Nextify"
 * ```
 */

/**
 * Brand configuration
 * Defines the product/brand identity
 */
export const BRAND_CONFIG = {
  /** Brand name - used throughout the application */
  name: "Basefly" as const,

  /** Legacy brand name - for backward compatibility */
  legacyName: "Saasfly" as const,

  /** Brand description - short tagline */
  description:
    "Enterprise-grade Kubernetes cluster management platform" as const,

  /** Extended description - for SEO and marketing */
  longDescription:
    "We provide an easier way to build saas service in production" as const,

  /** Brand tagline */
  tagline: "Ship your apps to the world easier" as const,

  /** Brand keywords for SEO */
  keywords: [
    "kubernetes",
    "k8s",
    "cluster management",
    "saas",
    "cloud",
    "infrastructure",
  ] as const,

  /** Brand colors - hex values */
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#FF782B",
  } as const,

  /** Brand assets */
  assets: {
    logo: "/saasfly-logo.svg",
    favicon: "/favicon.ico",
    ogImage: "", // Open Graph image path
  } as const,
} as const;

/**
 * Company configuration
 * Defines the company behind the product
 */
export const COMPANY_CONFIG = {
  /** Company name */
  name: "Nextify" as const,

  /** Company legal name */
  legalName: "Nextify Limited" as const,

  /** Company website */
  website: "https://nextify.ltd" as const,

  /** Contact email */
  email: "contact@nextify.ltd" as const,

  /** Support email */
  supportEmail: "support@saasfly.io" as const,

  /** Business contact email */
  businessEmail: "contact@nextify.ltd" as const,

  /** Physical address (if applicable) */
  address: null as string | null,

  /** Social media handles */
  social: {
    twitter: {
      handle: "@nextify2024",
      url: "https://x.com/nextify2024",
    },
    github: {
      org: "basefly",
      url: "https://github.com/basefly",
    },
    discord: {
      invite: "https://discord.gg/8SwSX43wnD",
    },
  } as const,
} as const;

/**
 * Repository configuration
 * GitHub repository information
 */
export const REPOSITORY_CONFIG = {
  /** Repository owner/organization */
  owner: "basefly" as const,

  /** Legacy organization name */
  legacyOwner: "saasfly" as const,

  /** Repository name */
  name: "basefly" as const,

  /** Legacy repository name */
  legacyName: "saasfly" as const,

  /** Full repository URL */
  get url(): string {
    return `https://github.com/${this.owner}/${this.name}`;
  },

  /** Legacy repository URL */
  get legacyUrl(): string {
    return `https://github.com/${this.legacyOwner}/${this.legacyName}`;
  },

  /** Contributors page URL */
  get contributorsUrl(): string {
    return `${this.url}/graphs/contributors`;
  },

  /** Issues page URL */
  get issuesUrl(): string {
    return `${this.url}/issues`;
  },

  /** Stars count - displayed on badges */
  stars: "2.5K" as const,

  /** Contributor count */
  contributorCount: 9 as const,
} as const;

/**
 * Application URLs
 * Centralized URL configuration for all environments
 */
export const APP_URLS = {
  /** Production application URL */
  production: "https://saasfly.io" as const,

  /** Demo/showcase URL */
  demo: "https://show.saasfly.io" as const,

  /** Documentation URL */
  docs: "https://docs.saasfly.io" as const,

  /** Local development URL */
  development: "http://localhost:3000" as const,

  /** Alternative development ports */
  altPorts: {
    port3001: "http://localhost:3001" as const,
    port3002: "http://localhost:3002" as const,
  } as const,

  /** Tailwind config viewer (development) */
  tailwindViewer: "http://localhost:3333" as const,
} as const;

/**
 * Feature configuration
 * High-level feature toggles and configuration
 */
export const FEATURE_CONFIG = {
  /** Enable/disable billing features */
  billing: {
    enabled: true,
    stripeIntegration: true,
    mockPayments: false,
  } as const,

  /** Enable/disable cluster management */
  clusters: {
    enabled: true,
    autoProvisioning: false,
    multiRegion: false,
  } as const,

  /** Enable/disable authentication methods */
  auth: {
    clerk: true,
    magicLinks: false,
    googleOAuth: false,
    githubOAuth: false,
  } as const,

  /** Enable/disable analytics */
  analytics: {
    vercel: true,
    posthog: false,
  } as const,

  /** Enable/disable notifications */
  notifications: {
    email: true,
    webhooks: false,
  } as const,

  /** Admin features */
  admin: {
    dashboard: true,
    userManagement: false,
  } as const,
} as const;

/**
 * Deployment configuration
 * Settings related to deployment and hosting
 */
export const DEPLOYMENT_CONFIG = {
  /** Primary hosting platform */
  platform: "vercel" as const,

  /** One-click deploy URL */
  get deployUrl(): string {
    const envVars = [
      "NEXT_PUBLIC_APP_URL",
      "CLERK_SECRET_KEY",
      "CLERK_PUBLISHABLE_KEY",
      "STRIPE_API_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "POSTGRES_URL",
      "RESEND_API_KEY",
      "RESEND_FROM",
      "ADMIN_EMAIL",
      "NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID",
      "NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID",
      "NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID",
      "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID",
      "NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID",
      "NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID",
      "NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID",
      "NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID",
    ].join(",");

    return `https://vercel.com/new/clone?repository-url=${encodeURIComponent(
      REPOSITORY_CONFIG.url,
    )}&env=${envVars}&install-command=bun%20install&build-command=bun%20run%20build&root-directory=apps%2Fnextjs`;
  },

  /** Required environment variables */
  requiredEnvVars: [
    "NEXT_PUBLIC_APP_URL",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY",
    "STRIPE_API_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "POSTGRES_URL",
  ] as const,

  /** Optional environment variables */
  optionalEnvVars: [
    "RESEND_API_KEY",
    "RESEND_FROM",
    "ADMIN_EMAIL",
    "NEXT_PUBLIC_POSTHOG_KEY",
  ] as const,
} as const;

/**
 * CLI configuration
 * Command-line interface settings
 */
export const CLI_CONFIG = {
  /** Primary installation command */
  primary: "bun create saasfly" as const,

  /** Alternative package managers */
  alternatives: {
    npm: "npx create-saasfly" as const,
    yarn: "yarn create saasfly" as const,
    pnpm: "pnpm create saasfly" as const,
    git: `git clone ${REPOSITORY_CONFIG.url}.git` as const,
  } as const,

  /** Development commands */
  dev: {
    web: "bun run dev:web" as const,
    full: "bun run dev" as const,
  } as const,

  /** Database commands */
  db: {
    push: "bun db:push" as const,
    migrate: "bun db:migrate" as const,
    generate: "bun db:generate" as const,
  } as const,
} as const;

/**
 * Marketing configuration
 * Marketing and SEO settings
 */
export const MARKETING_CONFIG = {
  /** SEO defaults */
  seo: {
    titleTemplate: "%s | Basefly" as const,
    defaultTitle: "Basefly - Enterprise Kubernetes Management" as const,
    defaultDescription: BRAND_CONFIG.description,
  } as const,

  /** Social proof */
  socialProof: {
    githubStars: REPOSITORY_CONFIG.stars,
    contributors: REPOSITORY_CONFIG.contributorCount,
    developers: 2000,
  } as const,

  /** Call to action defaults */
  cta: {
    primary: "Get Started" as const,
    secondary: "View Demo" as const,
    docs: "Read Documentation" as const,
  } as const,
} as const;

/**
 * Integration configuration
 * Third-party service integrations
 */
export const INTEGRATION_CONFIG = {
  /** Authentication provider */
  auth: {
    provider: "clerk" as const,
    docsUrl: "https://clerk.com/" as const,
    referralUrl: "https://go.clerk.com/uKDp7Au" as const,
  } as const,

  /** Payment provider */
  payment: {
    provider: "stripe" as const,
    docsUrl: "https://stripe.com/" as const,
  } as const,

  /** Email provider */
  email: {
    provider: "resend" as const,
    docsUrl: "https://resend.com/" as const,
  } as const,

  /** Database */
  database: {
    provider: "postgresql" as const,
    orm: "prisma" as const,
    docsUrl: "https://www.postgresql.org/" as const,
  } as const,

  /** Hosting */
  hosting: {
    provider: "vercel" as const,
    docsUrl: "https://vercel.com/" as const,
  } as const,

  /** Analytics */
  analytics: {
    vercel: {
      enabled: true,
      docsUrl: "https://vercel.com/analytics" as const,
    },
    posthog: {
      enabled: false,
      docsUrl: "https://posthog.com/" as const,
    },
  } as const,
} as const;

/**
 * Main project configuration export
 * Combines all configuration sections
 */
export const PROJECT_CONFIG = {
  brand: BRAND_CONFIG,
  company: COMPANY_CONFIG,
  repository: REPOSITORY_CONFIG,
  urls: APP_URLS,
  features: FEATURE_CONFIG,
  deployment: DEPLOYMENT_CONFIG,
  cli: CLI_CONFIG,
  marketing: MARKETING_CONFIG,
  integrations: INTEGRATION_CONFIG,
} as const;

/**
 * Type for the complete project configuration
 */
export type ProjectConfig = typeof PROJECT_CONFIG;

/**
 * Type for brand configuration
 */
export type BrandConfig = typeof BRAND_CONFIG;

/**
 * Type for company configuration
 */
export type CompanyConfig = typeof COMPANY_CONFIG;

/**
 * Type for repository configuration
 */
export type RepositoryConfig = typeof REPOSITORY_CONFIG;

/**
 * Helper function to get the current base URL based on environment
 */
export function getCurrentBaseUrl(envUrl?: string, nodeEnv?: string): string {
  if (envUrl) return envUrl;
  if (nodeEnv === "development") return APP_URLS.development;
  return APP_URLS.production;
}

/**
 * Helper function to check if a feature is enabled
 */
export function isProjectFeatureEnabled(featurePath: string): boolean {
  const parts = featurePath.split(".");
  let current: unknown = FEATURE_CONFIG;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }

  return typeof current === "boolean" ? current : false;
}

/**
 * Helper function to get brand name with fallback
 */
export function getBrandName(useLegacy = false): string {
  return useLegacy ? BRAND_CONFIG.legacyName : BRAND_CONFIG.name;
}

/**
 * Helper function to get repository URL
 */
export function getRepositoryUrl(useLegacy = false): string {
  return useLegacy ? REPOSITORY_CONFIG.legacyUrl : REPOSITORY_CONFIG.url;
}

// Default export for convenience
export default PROJECT_CONFIG;
