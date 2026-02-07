import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  shared: {
    // Stripe Configuration
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    
    // Site Configuration
    NEXT_PUBLIC_SITE_NAME: z.string().optional(),
    NEXT_PUBLIC_SITE_DESCRIPTION: z.string().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_GITHUB_URL: z.string().optional(),
    NEXT_PUBLIC_GITHUB_OWNER: z.string().optional(),
    NEXT_PUBLIC_GITHUB_REPO: z.string().optional(),
    NEXT_PUBLIC_SUPPORT_EMAIL: z.string().optional(),
    NEXT_PUBLIC_DOMAIN: z.string().optional(),
    
    // CLI Configuration
    NEXT_PUBLIC_CLI_INSTALL_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_NPM_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_YARN_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_PNPM_COMMAND: z.string().optional(),
    
    // i18n Configuration
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().optional(),
    NEXT_PUBLIC_SUPPORTED_LOCALES: z.string().optional(),
    
    // Rate Limiting Configuration
    NEXT_PUBLIC_RATE_LIMIT_READ_MAX: z.string().optional(),
    NEXT_PUBLIC_RATE_LIMIT_WRITE_MAX: z.string().optional(),
    NEXT_PUBLIC_RATE_LIMIT_STRIPE_MAX: z.string().optional(),
    NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS: z.string().optional(),
    
    // K8s Configuration
    NEXT_PUBLIC_DEFAULT_K8S_VERSION: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_NODE_COUNT: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_STORAGE_SIZE: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_CLUSTER_LOCATION: z.string().optional(),
    
    // CSP Configuration
    NEXT_PUBLIC_CSP_SCRIPT_SRC: z.string().optional(),
    NEXT_PUBLIC_CSP_STYLE_SRC: z.string().optional(),
    NEXT_PUBLIC_CSP_IMG_SRC: z.string().optional(),
    NEXT_PUBLIC_CSP_CONNECT_SRC: z.string().optional(),
  },
  server: {
    RESEND_API_KEY: z.string().optional(),
  },
  // Client side variables gets destructured here due to Next.js static analysis
  // Shared ones are also included here for good measure since the behavior has been inconsistent
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    // Stripe
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
    // Site
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_GITHUB_OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER,
    NEXT_PUBLIC_GITHUB_REPO: process.env.NEXT_PUBLIC_GITHUB_REPO,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    // CLI
    NEXT_PUBLIC_CLI_INSTALL_COMMAND: process.env.NEXT_PUBLIC_CLI_INSTALL_COMMAND,
    NEXT_PUBLIC_CLI_NPM_COMMAND: process.env.NEXT_PUBLIC_CLI_NPM_COMMAND,
    NEXT_PUBLIC_CLI_YARN_COMMAND: process.env.NEXT_PUBLIC_CLI_YARN_COMMAND,
    NEXT_PUBLIC_CLI_PNPM_COMMAND: process.env.NEXT_PUBLIC_CLI_PNPM_COMMAND,
    // i18n
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_SUPPORTED_LOCALES: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES,
    // Rate Limiting
    NEXT_PUBLIC_RATE_LIMIT_READ_MAX: process.env.NEXT_PUBLIC_RATE_LIMIT_READ_MAX,
    NEXT_PUBLIC_RATE_LIMIT_WRITE_MAX: process.env.NEXT_PUBLIC_RATE_LIMIT_WRITE_MAX,
    NEXT_PUBLIC_RATE_LIMIT_STRIPE_MAX: process.env.NEXT_PUBLIC_RATE_LIMIT_STRIPE_MAX,
    NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS: process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS,
    // K8s
    NEXT_PUBLIC_DEFAULT_K8S_VERSION: process.env.NEXT_PUBLIC_DEFAULT_K8S_VERSION,
    NEXT_PUBLIC_DEFAULT_NODE_COUNT: process.env.NEXT_PUBLIC_DEFAULT_NODE_COUNT,
    NEXT_PUBLIC_DEFAULT_STORAGE_SIZE: process.env.NEXT_PUBLIC_DEFAULT_STORAGE_SIZE,
    NEXT_PUBLIC_DEFAULT_CLUSTER_LOCATION: process.env.NEXT_PUBLIC_DEFAULT_CLUSTER_LOCATION,
    // CSP
    NEXT_PUBLIC_CSP_SCRIPT_SRC: process.env.NEXT_PUBLIC_CSP_SCRIPT_SRC,
    NEXT_PUBLIC_CSP_STYLE_SRC: process.env.NEXT_PUBLIC_CSP_STYLE_SRC,
    NEXT_PUBLIC_CSP_IMG_SRC: process.env.NEXT_PUBLIC_CSP_IMG_SRC,
    NEXT_PUBLIC_CSP_CONNECT_SRC: process.env.NEXT_PUBLIC_CSP_CONNECT_SRC,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
