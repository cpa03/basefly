const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined") {
    return process.env[key];
  }
  return undefined;
};

export const FEATURE_FLAGS = {
  billing: {
    enabled: getEnvVar("ENABLE_BILLING") !== "false",
    stripeCheckout: getEnvVar("ENABLE_STRIPE_CHECKOUT") !== "false",
    billingPortal: getEnvVar("ENABLE_BILLING_PORTAL") !== "false",
  },
  clusters: {
    enabled: getEnvVar("ENABLE_CLUSTERS") !== "false",
    autoProvisioning: getEnvVar("ENABLE_AUTO_PROVISIONING") === "true",
    multiRegion: getEnvVar("ENABLE_MULTI_REGION") === "true",
  },
  auth: {
    magicLinks: getEnvVar("ENABLE_MAGIC_LINKS") === "true",
    oauth: {
      google: getEnvVar("ENABLE_GOOGLE_OAUTH") === "true",
      github: getEnvVar("ENABLE_GITHUB_OAUTH") === "true",
    },
  },
  notifications: {
    email: getEnvVar("ENABLE_EMAIL_NOTIFICATIONS") !== "false",
    webhooks: getEnvVar("ENABLE_WEBHOOK_NOTIFICATIONS") === "true",
  },
  analytics: {
    posthog:
      getEnvVar("NEXT_PUBLIC_POSTHOG_KEY") &&
      getEnvVar("NEXT_PUBLIC_POSTHOG_KEY") !== " ",
    vercel: getEnvVar("ENABLE_VERCEL_ANALYTICS") !== "false",
  },
  admin: {
    dashboard: getEnvVar("ENABLE_ADMIN_DASHBOARD") !== "false",
    userManagement: getEnvVar("ENABLE_USER_MANAGEMENT") === "true",
  },
  dev: {
    debugMode: getEnvVar("IS_DEBUG") === "true",
    mockPayments: getEnvVar("ENABLE_MOCK_PAYMENTS") === "true",
    verboseLogging: getEnvVar("VERBOSE_LOGGING") === "true",
  },
  ai: {
    enabled: getEnvVar("ENABLE_AI_FEATURES") === "true",
    chatbot: getEnvVar("ENABLE_AI_CHATBOT") === "true",
    contentGeneration: getEnvVar("ENABLE_AI_CONTENT_GENERATION") === "true",
    recommendations: getEnvVar("ENABLE_AI_RECOMMENDATIONS") === "true",
    analytics: getEnvVar("ENABLE_AI_ANALYTICS") === "true",
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
  | "dev.verboseLogging"
  | "ai"
  | "ai.enabled"
  | "ai.chatbot"
  | "ai.contentGeneration"
  | "ai.recommendations"
  | "ai.analytics";
