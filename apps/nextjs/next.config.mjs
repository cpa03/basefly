// @ts-check
import "./src/env.mjs";
import "@saasfly/auth/env.mjs";

import { withNextDevtools } from "@next-devtools/core/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";
// import "@saasfly/api/env"
import withMDX from "@next/mdx";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

// Cache and security header values are centralized in @saasfly/common
// See: packages/common/src/config/cache.ts for canonical definitions
const CACHE_DURATION = {
  ONE_MINUTE: 60,
  ONE_YEAR: 31536000,
  HSTS_MAX_AGE: 63072000,
};

const CACHE_CONTROL = {
  NO_CACHE: "public, max-age=0, must-revalidate",
  IMMUTABLE: `public, max-age=${CACHE_DURATION.ONE_YEAR}, immutable`,
};

const HTTP_SECURITY_HEADERS = {
  HSTS: `max-age=${CACHE_DURATION.HSTS_MAX_AGE}; includeSubDomains; preload`,
  FRAME_OPTIONS: "SAMEORIGIN",
  CONTENT_TYPE_OPTIONS: "nosniff",
  REFERRER_POLICY: "origin-when-cross-origin",
  PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=()",
  DNS_PREFETCH_CONTROL: "on",
};

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@saasfly/api",
    "@saasfly/auth",
    "@saasfly/db",
    "@saasfly/common",
    "@saasfly/ui",
    "@saasfly/stripe",
  ],
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: CACHE_DURATION.ONE_MINUTE,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.twillot.com",
      },
      {
        protocol: "https",
        hostname: "**.setupyourpay.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "**.twimg.com",
      },
      {
        protocol: "https",
        hostname: "**.ruguoapp.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        hostname: "ui.aceternity.com",
      },
    ],
  },
  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  experimental: {
    mdxRs: true,
    optimizePackageImports: [
      "@saasfly/ui",
      "@saasfly/auth",
      "@saasfly/common",
      "@saasfly/api",
      "lucide-react",
      "@clerk/nextjs",
      "@clerk/types",
      "vaul",
      "@radix-ui/react-icons",
      "react-wrap-balancer",
      "date-fns",
    ],
    optimizeCss: true,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: HTTP_SECURITY_HEADERS.DNS_PREFETCH_CONTROL,
          },
          {
            key: "Strict-Transport-Security",
            value: HTTP_SECURITY_HEADERS.HSTS,
          },
          {
            key: "X-Frame-Options",
            value: HTTP_SECURITY_HEADERS.FRAME_OPTIONS,
          },
          {
            key: "X-Content-Type-Options",
            value: HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
          },
          {
            key: "Referrer-Policy",
            value: HTTP_SECURITY_HEADERS.REFERRER_POLICY,
          },
          {
            key: "Permissions-Policy",
            value: HTTP_SECURITY_HEADERS.PERMISSIONS_POLICY,
          },
          {
            key: "Cache-Control",
            value: CACHE_CONTROL.NO_CACHE,
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_CONTROL.IMMUTABLE,
          },
        ],
      },
      {
        source: "/:path*.:ext(js|css|woff2|png|jpg|jpeg|gif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: CACHE_CONTROL.IMMUTABLE,
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: HTTP_SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
          },
        ],
      },
    ];
  },
};

const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withNextDevtools(withMDX()(withBundleAnalyzerConfig(config)));
