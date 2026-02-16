import { env } from "../env.mjs";

export const FEATURE_FLAGS = {
  billing: {
    enabled: env.ENABLE_BILLING !== "false",
    stripeCheckout: env.ENABLE_STRIPE_CHECKOUT !== "false",
    billingPortal: env.ENABLE_BILLING_PORTAL !== "false",
  },
  clusters: {
    enabled: env.ENABLE_CLUSTERS !== "false",
    autoProvisioning: env.ENABLE_AUTO_PROVISIONING === "true",
    multiRegion: env.ENABLE_MULTI_REGION === "true",
  },
  auth: {
    magicLinks: env.ENABLE_MAGIC_LINKS === "true",
    oauth: {
      google: env.ENABLE_GOOGLE_OAUTH === "true",
      github: env.ENABLE_GITHUB_OAUTH === "true",
    },
  },
  notifications: {
    email: env.ENABLE_EMAIL_NOTIFICATIONS !== "false",
    webhooks: env.ENABLE_WEBHOOK_NOTIFICATIONS === "true",
  },
  analytics: {
    posthog: env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_KEY !== " ",
    vercel: env.ENABLE_VERCEL_ANALYTICS !== "false",
  },
  admin: {
    dashboard: env.ENABLE_ADMIN_DASHBOARD !== "false",
    userManagement: env.ENABLE_USER_MANAGEMENT === "true",
  },
  dev: {
    debugMode: env.IS_DEBUG === "true",
    mockPayments: env.ENABLE_MOCK_PAYMENTS === "true",
    verboseLogging: env.VERBOSE_LOGGING === "true",
  },
} as const;

export function isFeatureEnabled(path: string): boolean {
  const parts = path.split(".");
  let current: unknown = FEATURE_FLAGS;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }

  return typeof current === "boolean" ? current : false;
}

export function getEnabledFeatures(): string[] {
  const enabled: string[] = [];

  function traverse(obj: Record<string, unknown>, prefix = ""): void {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "boolean") {
        if (value) enabled.push(path);
      } else if (typeof value === "object" && value !== null) {
        traverse(value as Record<string, unknown>, path);
      }
    }
  }

  traverse(FEATURE_FLAGS as Record<string, unknown>);
  return enabled;
}

export type FeatureFlagPath =
  | "billing"
  | "billing.stripeCheckout"
  | "billing.billingPortal"
  | "clusters"
  | "clusters.autoProvisioning"
  | "clusters.multiRegion"
  | "auth"
  | "auth.magicLinks"
  | "auth.oauth"
  | "auth.oauth.google"
  | "auth.oauth.github"
  | "notifications"
  | "notifications.email"
  | "notifications.webhooks"
  | "analytics"
  | "analytics.posthog"
  | "analytics.vercel"
  | "admin"
  | "admin.dashboard"
  | "admin.userManagement"
  | "dev"
  | "dev.debugMode"
  | "dev.mockPayments"
  | "dev.verboseLogging";
