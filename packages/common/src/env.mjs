import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

/**
 * Environment variable validation and types
 * 
 * Flexy Principle: All configuration through environment variables!
 */
export const env = createEnv({
  shared: {
    // Stripe configuration
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    
    // Site configuration
    NEXT_PUBLIC_APP_NAME: z.string().optional(),
    NEXT_PUBLIC_APP_DESCRIPTION: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_OG_IMAGE: z.string().optional(),
    
    // GitHub configuration
    NEXT_PUBLIC_GITHUB_OWNER: z.string().optional(),
    NEXT_PUBLIC_GITHUB_REPO: z.string().optional(),
    NEXT_PUBLIC_GITHUB_URL: z.string().url().optional(),
    NEXT_PUBLIC_GITHUB_STARS: z.string().optional(),
    
    // CLI configuration
    NEXT_PUBLIC_CLI_PRIMARY_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_NPM_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_YARN_COMMAND: z.string().optional(),
    NEXT_PUBLIC_CLI_PNPM_COMMAND: z.string().optional(),
    
    // i18n configuration
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().optional(),
    NEXT_PUBLIC_LOCALES: z.string().optional(),
    
    // CSP configuration
    NEXT_PUBLIC_CSP_IMG_DOMAINS: z.string().optional(),
    NEXT_PUBLIC_CSP_CONNECT_DOMAINS: z.string().optional(),
    NEXT_PUBLIC_CSP_FRAME_DOMAINS: z.string().optional(),
    
    // Pricing configuration
    PRICING_TIERS_JSON: z.string().optional(),
    PRICING_STARTER_MONTHLY: z.string().optional(),
    PRICING_STARTER_YEARLY: z.string().optional(),
    PRICING_PRO_MONTHLY: z.string().optional(),
    PRICING_PRO_YEARLY: z.string().optional(),
    PRICING_BUSINESS_MONTHLY: z.string().optional(),
    PRICING_BUSINESS_YEARLY: z.string().optional(),
    PRICING_CURRENCY: z.string().optional(),
    
    // Resource limits
    CLUSTER_LIMIT_STARTER: z.string().optional(),
    CLUSTER_LIMIT_PRO: z.string().optional(),
    CLUSTER_LIMIT_BUSINESS: z.string().optional(),
    RESOURCE_LIMIT_STARTER_POSTS: z.string().optional(),
    RESOURCE_LIMIT_PRO_POSTS: z.string().optional(),
  },
  server: {
    RESEND_API_KEY: z.string().optional(),
    
    // Kubernetes configuration
    CLUSTER_LOCATIONS: z.string().optional(),
    DEFAULT_CLUSTER_LOCATION: z.string().optional(),
    K8S_DEFAULT_NODE_COUNT: z.string().optional(),
    K8S_DEFAULT_NODE_TYPE: z.string().optional(),
    K8S_DEFAULT_STORAGE_SIZE: z.string().optional(),
    K8S_DEFAULT_VERSION: z.string().optional(),
    K8S_MAX_NAME_LENGTH: z.string().optional(),
    K8S_TIER_LIMIT_FREE: z.string().optional(),
    K8S_TIER_LIMIT_PRO: z.string().optional(),
    K8S_TIER_LIMIT_BUSINESS: z.string().optional(),
  },
  runtimeEnv: {
    // Stripe
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
    
    // Site
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_OG_IMAGE: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
    
    // GitHub
    NEXT_PUBLIC_GITHUB_OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER,
    NEXT_PUBLIC_GITHUB_REPO: process.env.NEXT_PUBLIC_GITHUB_REPO,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_GITHUB_STARS: process.env.NEXT_PUBLIC_GITHUB_STARS,
    
    // CLI
    NEXT_PUBLIC_CLI_PRIMARY_COMMAND: process.env.NEXT_PUBLIC_CLI_PRIMARY_COMMAND,
    NEXT_PUBLIC_CLI_NPM_COMMAND: process.env.NEXT_PUBLIC_CLI_NPM_COMMAND,
    NEXT_PUBLIC_CLI_YARN_COMMAND: process.env.NEXT_PUBLIC_CLI_YARN_COMMAND,
    NEXT_PUBLIC_CLI_PNPM_COMMAND: process.env.NEXT_PUBLIC_CLI_PNPM_COMMAND,
    
    // i18n
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_LOCALES: process.env.NEXT_PUBLIC_LOCALES,
    
    // CSP
    NEXT_PUBLIC_CSP_IMG_DOMAINS: process.env.NEXT_PUBLIC_CSP_IMG_DOMAINS,
    NEXT_PUBLIC_CSP_CONNECT_DOMAINS: process.env.NEXT_PUBLIC_CSP_CONNECT_DOMAINS,
    NEXT_PUBLIC_CSP_FRAME_DOMAINS: process.env.NEXT_PUBLIC_CSP_FRAME_DOMAINS,
    
    // Pricing
    PRICING_TIERS_JSON: process.env.PRICING_TIERS_JSON,
    PRICING_STARTER_MONTHLY: process.env.PRICING_STARTER_MONTHLY,
    PRICING_STARTER_YEARLY: process.env.PRICING_STARTER_YEARLY,
    PRICING_PRO_MONTHLY: process.env.PRICING_PRO_MONTHLY,
    PRICING_PRO_YEARLY: process.env.PRICING_PRO_YEARLY,
    PRICING_BUSINESS_MONTHLY: process.env.PRICING_BUSINESS_MONTHLY,
    PRICING_BUSINESS_YEARLY: process.env.PRICING_BUSINESS_YEARLY,
    PRICING_CURRENCY: process.env.PRICING_CURRENCY,
    
    // Resource limits
    CLUSTER_LIMIT_STARTER: process.env.CLUSTER_LIMIT_STARTER,
    CLUSTER_LIMIT_PRO: process.env.CLUSTER_LIMIT_PRO,
    CLUSTER_LIMIT_BUSINESS: process.env.CLUSTER_LIMIT_BUSINESS,
    RESOURCE_LIMIT_STARTER_POSTS: process.env.RESOURCE_LIMIT_STARTER_POSTS,
    RESOURCE_LIMIT_PRO_POSTS: process.env.RESOURCE_LIMIT_PRO_POSTS,
    
    // Kubernetes
    CLUSTER_LOCATIONS: process.env.CLUSTER_LOCATIONS,
    DEFAULT_CLUSTER_LOCATION: process.env.DEFAULT_CLUSTER_LOCATION,
    K8S_DEFAULT_NODE_COUNT: process.env.K8S_DEFAULT_NODE_COUNT,
    K8S_DEFAULT_NODE_TYPE: process.env.K8S_DEFAULT_NODE_TYPE,
    K8S_DEFAULT_STORAGE_SIZE: process.env.K8S_DEFAULT_STORAGE_SIZE,
    K8S_DEFAULT_VERSION: process.env.K8S_DEFAULT_VERSION,
    K8S_MAX_NAME_LENGTH: process.env.K8S_MAX_NAME_LENGTH,
    K8S_TIER_LIMIT_FREE: process.env.K8S_TIER_LIMIT_FREE,
    K8S_TIER_LIMIT_PRO: process.env.K8S_TIER_LIMIT_PRO,
    K8S_TIER_LIMIT_BUSINESS: process.env.K8S_TIER_LIMIT_BUSINESS,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
