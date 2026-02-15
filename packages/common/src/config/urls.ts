/**
 * External URLs Configuration
 *
 * This module provides a single source of truth for all external URLs,
 * eliminating hardcoded links scattered across the codebase.
 *
 * @module @saasfly/common/config/urls
 */

/**
 * External service URLs
 * These are third-party services used by the application
 */
export const EXTERNAL_URLS = {
  /** Libra AI service */
  libra: {
    home: "https://libra.dev/",
  },
  /** Documentation site */
  docs: {
    home: "https://docs.saasfly.io",
  },
  /** Demo/showcase site */
  demo: {
    home: "https://show.saasfly.io",
  },
  /** Main marketing site */
  marketing: {
    home: "https://saasfly.io",
  },
  /** Discord community */
  discord: {
    invite: "https://discord.gg/b9uTZjdkrb",
  },
  /** Twitter/X profiles */
  twitter: {
    nextify: "https://x.com/nextify2024",
    bingxunYao: "https://x.com/BingxunYao",
  },
  /** Vercel deployment */
  vercel: {
    deploy:
      "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaasfly%2Fsaasfly&env=NEXT_PUBLIC_APP_URL,CLERK_SECRET_KEY,CLERK_PUBLISHABLE_KEY,NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,RESEND_API_KEY,RESEND_FROM,ADMIN_EMAIL&install-command=bun%20install&build-command=bun%20run%20build&root-directory=apps%2Fnextjs",
  },
  /** One-click deployment service */
  oneclick: {
    home: "https://oneclick.sh/",
  },
  /** Open Collective */
  opencollective: {
    saasfly: "https://opencollective.com/saasfly",
  },
  /** Clerk authentication service */
  clerk: {
    referral: "https://go.clerk.com/uKDp7Au",
  },
  /** Twillot service */
  twillot: {
    home: "https://www.twillot.com/",
    logo: "https://www.twillot.com/logo-128.png",
  },
  /** SetupYourPay service */
  setupyourpay: {
    home: "https://www.setupyourpay.com/",
    logo: "https://www.setupyourpay.com/logo.png",
  },
  /** GitHub */
  github: {
    org: "https://github.com/saasfly",
    repo: "https://github.com/saasfly/saasfly",
    contributors: "https://github.com/saasfly/saasfly/graphs/contributors",
  },
  /** Avatar placeholder service */
  avatar: {
    vercel: (name: string) => `https://avatar.vercel.sh/${name}`,
  },
  /** Content CDN */
  cdn: {
    sanity:
      "https://cdn.sanity.io/images/tpb4obti/production/50c13f886c039225be4e7e99023b8f1e2b4161b9-1792x1024.png",
    twitterProfile:
      "https://pbs.twimg.com/profile_images/1766283284370305025/QKXW5W3M_400x400.jpg",
    ruguoapp: "https://cdnv2.ruguoapp.com/FoAVSRtT2zVc96oDjAWrd5TvXXQ4v3.png",
  },
  /** Aceternity UI assets */
  aceternity: {
    linearImage:
      "https://ui.aceternity.com/_next/image?url=%2Flinear.webp&w=1080&q=75",
  },
  /** X/Twitter broadcast */
  xBroadcast: {
    demo: "https://x.com/i/broadcasts/1eaKbaYVAXkxX",
  },
} as const;

/**
 * Internal route paths
 * Centralized path definitions for internal navigation
 */
export const ROUTES = {
  /** Marketing pages */
  marketing: {
    home: "/",
    features: "/#features",
    pricing: "/pricing",
    blog: "/blog",
    docs: "/docs",
    guides: "/guides",
  },
  /** Dashboard pages */
  dashboard: {
    home: "/dashboard/",
    billing: "/dashboard/billing",
    settings: "/dashboard/settings",
  },
  /** Documentation pages */
  docs: {
    home: "/docs",
    documentation: "/docs/documentation",
    components: "/docs/documentation/components",
    codeBlocks: "/docs/documentation/code-blocks",
    styleGuide: "/docs/documentation/style-guide",
    inProgress: "/docs/in-progress",
  },
  /** Admin pages */
  admin: {
    dashboard: "/admin/dashboard",
  },
  /** API routes */
  api: {
    webhooks: {
      stripe: "/api/webhooks/stripe",
    },
    trpc: {
      edge: "/api/trpc/edge",
    },
  },
} as const;

/**
 * Contact information
 */
export const CONTACT = {
  /** Support email */
  support: {
    email: "support@saasfly.io",
    subject: "Support Request",
  },
  /** Business contact */
  business: {
    email: "contact@nextify.ltd",
  },
} as const;

/**
 * GitHub repository info
 */
export const GITHUB_REPO = {
  owner: "saasfly",
  repo: "saasfly",
  stars: "2.5K", // Set to null to fetch dynamically
} as const;

/**
 * CLI commands
 */
export const CLI_COMMANDS = {
  primary: "bun create saasfly",
  alternatives: {
    npm: "npx create-saasfly",
    yarn: "yarn create saasfly",
    pnpm: "pnpm create saasfly",
  },
} as const;

/**
 * Brand information
 */
export const BRAND = {
  name: "Saasfly",
  description: "We provide an easier way to build saas service in production",
  tagline: "Enterprise-grade Kubernetes cluster management platform",
} as const;

/**
 * Type for external URL categories
 */
export type ExternalUrlCategory = keyof typeof EXTERNAL_URLS;

/**
 * Type for route sections
 */
export type RouteSection = keyof typeof ROUTES;

/**
 * Get an external URL by path
 * Helper function for type-safe URL access
 */
export function getExternalUrl<K extends keyof typeof EXTERNAL_URLS>(
  key: K,
): (typeof EXTERNAL_URLS)[K] {
  return EXTERNAL_URLS[key];
}

/**
 * Get an internal route by section and path
 * Helper function for type-safe route access
 */
export function getRoute<
  S extends keyof typeof ROUTES,
  P extends keyof (typeof ROUTES)[S],
>(section: S, path: P): (typeof ROUTES)[S][P] {
  return ROUTES[section][path];
}

/**
 * Generate avatar URL
 */
export function getAvatarUrl(name: string): string {
  return EXTERNAL_URLS.avatar.vercel(name);
}

/**
 * Get GitHub profile URL for a user
 */
export function getGitHubProfileUrl(username: string): string {
  return `https://avatars.githubusercontent.com/u/${username}`;
}

/**
 * Development and local environment URLs
 * Centralized to ensure consistency across development tools
 */
export const DEV_URLS = {
  /** Default local development server URL */
  localhost: "http://localhost:3000",
  /** Local WebSocket URL for HMR */
  localWs: "ws://localhost:12882/",
  /** Alternative local development ports */
  altPorts: {
    /** Alternative port 3001 */
    port3001: "http://localhost:3001",
    /** Alternative port 3002 */
    port3002: "http://localhost:3002",
  },
} as const;

/**
 * Get the appropriate base URL for the current environment
 * @param envUrl - Optional environment URL override (e.g., NEXT_PUBLIC_APP_URL)
 * @param nodeEnv - Current NODE_ENV value
 * @returns The base URL to use
 */
export function getBaseUrl(envUrl?: string, nodeEnv?: string): string {
  if (envUrl) return envUrl;
  if (nodeEnv === "development") return DEV_URLS.localhost;
  throw new Error(
    "Base URL is not defined. Please set NEXT_PUBLIC_APP_URL in your environment variables.",
  );
}
