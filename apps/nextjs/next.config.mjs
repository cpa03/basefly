// @ts-check
import "./src/env.mjs";
import "@saasfly/auth/env.mjs";

import { withNextDevtools } from "@next-devtools/core/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";
// import "@saasfly/api/env"
import withMDX from "@next/mdx";
import {
  CACHE_CONTROL,
  CACHE_DURATION,
  SECURITY_HEADERS,
} from "@saasfly/common";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

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
            value: SECURITY_HEADERS.DNS_PREFETCH_CONTROL,
          },
          {
            key: "Strict-Transport-Security",
            value: SECURITY_HEADERS.HSTS,
          },
          {
            key: "X-Frame-Options",
            value: SECURITY_HEADERS.FRAME_OPTIONS,
          },
          {
            key: "X-Content-Type-Options",
            value: SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
          },
          {
            key: "Referrer-Policy",
            value: SECURITY_HEADERS.REFERRER_POLICY,
          },
          {
            key: "Permissions-Policy",
            value: SECURITY_HEADERS.PERMISSIONS_POLICY,
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
            value: SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
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
