import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().min(1),
    STRIPE_API_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    ADMIN_EMAIL: z.string().min(1),
    RESEND_FROM: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    RESEND_FROM: process.env.RESEND_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID:
      process.env.NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID,
    NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID:
      process.env.NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID,
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
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
