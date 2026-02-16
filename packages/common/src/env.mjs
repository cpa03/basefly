import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  shared: {
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  },
  server: {
    RESEND_API_KEY: z.string().optional(),
    ENABLE_BILLING: z.enum(["true", "false"]).optional(),
    ENABLE_STRIPE_CHECKOUT: z.enum(["true", "false"]).optional(),
    ENABLE_BILLING_PORTAL: z.enum(["true", "false"]).optional(),
    ENABLE_CLUSTERS: z.enum(["true", "false"]).optional(),
    ENABLE_AUTO_PROVISIONING: z.enum(["true", "false"]).optional(),
    ENABLE_MULTI_REGION: z.enum(["true", "false"]).optional(),
    ENABLE_MAGIC_LINKS: z.enum(["true", "false"]).optional(),
    ENABLE_GOOGLE_OAUTH: z.enum(["true", "false"]).optional(),
    ENABLE_GITHUB_OAUTH: z.enum(["true", "false"]).optional(),
    ENABLE_EMAIL_NOTIFICATIONS: z.enum(["true", "false"]).optional(),
    ENABLE_WEBHOOK_NOTIFICATIONS: z.enum(["true", "false"]).optional(),
    ENABLE_VERCEL_ANALYTICS: z.enum(["true", "false"]).optional(),
    ENABLE_ADMIN_DASHBOARD: z.enum(["true", "false"]).optional(),
    ENABLE_USER_MANAGEMENT: z.enum(["true", "false"]).optional(),
    IS_DEBUG: z.enum(["true", "false"]).optional(),
    ENABLE_MOCK_PAYMENTS: z.enum(["true", "false"]).optional(),
    VERBOSE_LOGGING: z.enum(["true", "false"]).optional(),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    ENABLE_BILLING: process.env.ENABLE_BILLING,
    ENABLE_STRIPE_CHECKOUT: process.env.ENABLE_STRIPE_CHECKOUT,
    ENABLE_BILLING_PORTAL: process.env.ENABLE_BILLING_PORTAL,
    ENABLE_CLUSTERS: process.env.ENABLE_CLUSTERS,
    ENABLE_AUTO_PROVISIONING: process.env.ENABLE_AUTO_PROVISIONING,
    ENABLE_MULTI_REGION: process.env.ENABLE_MULTI_REGION,
    ENABLE_MAGIC_LINKS: process.env.ENABLE_MAGIC_LINKS,
    ENABLE_GOOGLE_OAUTH: process.env.ENABLE_GOOGLE_OAUTH,
    ENABLE_GITHUB_OAUTH: process.env.ENABLE_GITHUB_OAUTH,
    ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS,
    ENABLE_WEBHOOK_NOTIFICATIONS: process.env.ENABLE_WEBHOOK_NOTIFICATIONS,
    ENABLE_VERCEL_ANALYTICS: process.env.ENABLE_VERCEL_ANALYTICS,
    ENABLE_ADMIN_DASHBOARD: process.env.ENABLE_ADMIN_DASHBOARD,
    ENABLE_USER_MANAGEMENT: process.env.ENABLE_USER_MANAGEMENT,
    IS_DEBUG: process.env.IS_DEBUG,
    ENABLE_MOCK_PAYMENTS: process.env.ENABLE_MOCK_PAYMENTS,
    VERBOSE_LOGGING: process.env.VERBOSE_LOGGING,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
