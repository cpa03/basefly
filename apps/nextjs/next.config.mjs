// @ts-check
import "./src/env.mjs";
import "@saasfly/auth/env.mjs";

import { withNextDevtools } from "@next-devtools/core/plugin";
// import "@saasfly/api/env"
import withMDX from "@next/mdx";
import withBundleAnalyzer from "@next/bundle-analyzer";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Use webpack instead of Turbopack for compatibility with existing config */
  turbopack: {},
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
    minimumCacheTTL: 60,
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
    ],
  },
  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    mdxRs: true,
    optimizePackageImports: ["@saasfly/ui", "lucide-react"],
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
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
