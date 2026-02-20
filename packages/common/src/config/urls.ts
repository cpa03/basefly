import {
  APP_URLS,
  BRAND_CONFIG,
  CLI_CONFIG,
  COMPANY_CONFIG,
  REPOSITORY_CONFIG,
} from "./project";

/**
 * External URLs Configuration
 *
 * This module provides a single source of truth for all external URLs,
 * eliminating hardcoded links scattered across the codebase.
 *
 * @module @saasfly/common/config/urls
 */

export const EXTERNAL_URLS = {
  libra: {
    home: "https://libra.dev/",
  },
  docs: {
    home: APP_URLS.docs,
  },
  demo: {
    home: APP_URLS.demo,
  },
  marketing: {
    home: APP_URLS.production,
  },
  discord: {
    invite: COMPANY_CONFIG.social.discord.invite,
  },
  twitter: {
    nextify: COMPANY_CONFIG.social.twitter.url,
    bingxunYao: "https://x.com/BingxunYao",
  },
  vercel: {
    deploy: REPOSITORY_CONFIG.url,
  },
  oneclick: {
    home: "https://oneclick.sh/",
  },
  opencollective: {
    saasfly: "https://opencollective.com/saasfly",
  },
  clerk: {
    referral: "https://go.clerk.com/uKDp7Au",
  },
  twillot: {
    home: "https://www.twillot.com/",
    logo: "https://www.twillot.com/logo-128.png",
  },
  setupyourpay: {
    home: "https://www.setupyourpay.com/",
    logo: "https://www.setupyourpay.com/logo.png",
  },
  github: {
    org: REPOSITORY_CONFIG.url,
    repo: REPOSITORY_CONFIG.url,
    contributors: REPOSITORY_CONFIG.contributorsUrl,
  },
  avatar: {
    vercel: (name: string) => `https://avatar.vercel.sh/${name}`,
  },
  cdn: {
    sanity:
      "https://cdn.sanity.io/images/tpb4obti/production/50c13f886c039225be4e7e99023b8f1e2b4161b9-1792x1024.png",
    twitterProfile:
      "https://pbs.twimg.com/profile_images/1766283284370305025/QKXW5W3M_400x400.jpg",
    ruguoapp: "https://cdnv2.ruguoapp.com/FoAVSRtT2zVc96oDjAWrd5TvXXQ4v3.png",
  },
  aceternity: {
    linearImage:
      "https://ui.aceternity.com/_next/image?url=%2Flinear.webp&w=1080&q=75",
  },
  xBroadcast: {
    demo: "https://x.com/i/broadcasts/1eaKbaYVAXkxX",
  },
} as const;

export const ROUTES = {
  marketing: {
    home: "/",
    features: "/#features",
    pricing: "/pricing",
    blog: "/blog",
    docs: "/docs",
    guides: "/guides",
  },
  dashboard: {
    home: "/dashboard/",
    billing: "/dashboard/billing",
    settings: "/dashboard/settings",
  },
  docs: {
    home: "/docs",
    documentation: "/docs/documentation",
    components: "/docs/documentation/components",
    codeBlocks: "/docs/documentation/code-blocks",
    styleGuide: "/docs/documentation/style-guide",
    inProgress: "/docs/in-progress",
  },
  admin: {
    dashboard: "/admin/dashboard",
  },
  api: {
    webhooks: {
      stripe: "/api/webhooks/stripe",
    },
    trpc: {
      edge: "/api/trpc/edge",
    },
  },
} as const;

export const CONTACT = {
  support: {
    email: COMPANY_CONFIG.supportEmail,
    subject: "Support Request",
  },
  business: {
    email: COMPANY_CONFIG.businessEmail,
  },
} as const;

export const GITHUB_REPO = {
  owner: REPOSITORY_CONFIG.owner,
  repo: REPOSITORY_CONFIG.name,
  stars: REPOSITORY_CONFIG.stars,
} as const;

export const CLI_COMMANDS = CLI_CONFIG;

export const BRAND = {
  name: BRAND_CONFIG.legacyName,
  description: BRAND_CONFIG.longDescription,
  tagline: BRAND_CONFIG.description,
} as const;

export type ExternalUrlCategory = keyof typeof EXTERNAL_URLS;

export type RouteSection = keyof typeof ROUTES;

export function getExternalUrl<K extends keyof typeof EXTERNAL_URLS>(
  key: K,
): (typeof EXTERNAL_URLS)[K] {
  return EXTERNAL_URLS[key];
}

export function getRoute<
  S extends keyof typeof ROUTES,
  P extends keyof (typeof ROUTES)[S],
>(section: S, path: P): (typeof ROUTES)[S][P] {
  return ROUTES[section][path];
}

export function getAvatarUrl(name: string): string {
  return EXTERNAL_URLS.avatar.vercel(name);
}

export function getGitHubProfileUrl(username: string): string {
  return `https://avatars.githubusercontent.com/u/${username}`;
}

export function getTwitterProfileUrl(username: string): string {
  return `https://x.com/${username}`;
}

export const DEV_URLS = {
  localhost: APP_URLS.development,
  localWs: "ws://localhost:12882/",
  altPorts: APP_URLS.altPorts,
} as const;

export function getBaseUrl(envUrl?: string, nodeEnv?: string): string {
  if (envUrl) return envUrl;
  if (nodeEnv === "development") return DEV_URLS.localhost;
  throw new Error(
    "Base URL is not defined. Please set NEXT_PUBLIC_APP_URL in your environment variables, or run with NODE_ENV=development to use the default localhost URL. See .env.example for reference.",
  );
}
