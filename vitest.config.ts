import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./apps/nextjs/src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["packages/**/*.{ts,tsx}", "apps/nextjs/src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "tooling/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/types/**",
        "**/index.ts",
        // Next.js App Router framework-glue files that are not unit-testable
        // and cannot be parsed by the V8 coverage provider's Rollup parser.
        "**/app/layout.tsx",
        "**/app/global-error.tsx",
        "**/app/not-found.tsx",
        "**/app/**/page.tsx",
        "**/app/**/route.ts",
        "**/app/**/layout.tsx",
        "**/app/**/loading.tsx",
        "apps/nextjs/src/proxy.ts",
        "apps/nextjs/src/instrumentation.ts",
        "apps/nextjs/src/trpc/server.ts",
        "apps/nextjs/src/lib/get-dictionary.ts",
        "apps/nextjs/src/components/content/mdx-components.tsx",
        "apps/nextjs/src/components/docs/pager.tsx",
        // Marketing/visual-effect components not covered by unit tests.
        "apps/nextjs/src/components/blog-card.tsx",
        "apps/nextjs/src/components/card-hover-effect.tsx",
        "apps/nextjs/src/components/command-palette.tsx",
        "apps/nextjs/src/components/comments.tsx",
        "apps/nextjs/src/components/document-guide.tsx",
        "apps/nextjs/src/components/features-card.tsx",
        "apps/nextjs/src/components/infiniteMovingCards.tsx",
        "apps/nextjs/src/components/meteors-card.tsx",
        "apps/nextjs/src/components/price/pricing-cards.tsx",
        "apps/nextjs/src/components/price/pricing-faq.tsx",
        "apps/nextjs/src/components/questions.tsx",
        "apps/nextjs/src/components/rightside-marketing.tsx",
        "apps/nextjs/src/components/textGenerateEffect.tsx",
        "apps/nextjs/src/components/typewriterEffectSmooth.tsx",
        "apps/nextjs/src/components/video-scroll.tsx",
        "apps/nextjs/src/components/wobble.tsx",
        "apps/nextjs/src/components/word-reveal.tsx",
      ],
      thresholds: {
        statements: 25,
        branches: 20,
        functions: 20,
        lines: 25,
      },
    },
    include: [
      "packages/**/*.test.{ts,tsx}",
      "apps/nextjs/src/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "node_modules/",
      "tooling/",
      "**/node_modules/**",
      "packages/**/node_modules/**",
    ],
    root: ".",
  },
  resolve: {
    alias: {
      // Specific sub-path aliases MUST come before broader ones
      // (Vite uses prefix matching — first match wins)
      "@saasfly/auth": resolve(__dirname, "./packages/auth"),
      "@saasfly/db": resolve(__dirname, "./packages/db"),
      "@saasfly/ui/icons": resolve(__dirname, "./packages/ui/src/icons.tsx"),
      "@saasfly/ui/card": resolve(__dirname, "./packages/ui/src/card.tsx"),
      "@saasfly/ui/skeleton": resolve(
        __dirname,
        "./packages/ui/src/skeleton.tsx",
      ),
      "@saasfly/ui/button": resolve(__dirname, "./packages/ui/src/button.tsx"),
      "@saasfly/ui/dialog": resolve(__dirname, "./packages/ui/src/dialog.tsx"),
      "@saasfly/ui/dropdown-menu": resolve(
        __dirname,
        "./packages/ui/src/dropdown-menu.tsx",
      ),
      "@saasfly/ui/form": resolve(__dirname, "./packages/ui/src/form.tsx"),
      "@saasfly/ui/input": resolve(__dirname, "./packages/ui/src/input.tsx"),
      "@saasfly/ui/label": resolve(__dirname, "./packages/ui/src/label.tsx"),
      "@saasfly/ui/select": resolve(__dirname, "./packages/ui/src/select.tsx"),
      "@saasfly/ui/tabs": resolve(__dirname, "./packages/ui/src/tabs.tsx"),
      "@saasfly/ui/tooltip": resolve(
        __dirname,
        "./packages/ui/src/tooltip.tsx",
      ),
      "@saasfly/ui/table": resolve(__dirname, "./packages/ui/src/table.tsx"),
      "@saasfly/ui/avatar": resolve(__dirname, "./packages/ui/src/avatar.tsx"),
      "@saasfly/ui/alert-dialog": resolve(
        __dirname,
        "./packages/ui/src/alert-dialog.tsx",
      ),
      "@saasfly/ui/status-badge": resolve(
        __dirname,
        "./packages/ui/src/status-badge.tsx",
      ),
      "@saasfly/ui/use-toast": resolve(
        __dirname,
        "./packages/ui/src/use-toast.tsx",
      ),
      "@saasfly/ui/toast": resolve(__dirname, "./packages/ui/src/toast.tsx"),
      "@saasfly/ui": resolve(__dirname, "./packages/ui"),
      "@saasfly/common/config/resilience": resolve(
        __dirname,
        "./packages/common/src/config/resilience.ts",
      ),
      "@saasfly/common/config/ui": resolve(
        __dirname,
        "./packages/common/src/config/ui.ts",
      ),
      "@saasfly/common/config/k8s": resolve(
        __dirname,
        "./packages/common/src/config/k8s.ts",
      ),
      "@saasfly/common/config/pricing": resolve(
        __dirname,
        "./packages/common/src/config/pricing.ts",
      ),
      "@saasfly/common/config/site": resolve(
        __dirname,
        "./packages/common/src/config/site.ts",
      ),
      "@saasfly/common/logger": resolve(
        __dirname,
        "./packages/common/src/logger.ts",
      ),
      "@saasfly/common/observability": resolve(
        __dirname,
        "./packages/common/src/observability/index.ts",
      ),
      "@saasfly/common": resolve(__dirname, "./packages/common"),
      "@saasfly/stripe": resolve(__dirname, "./packages/stripe"),
      "@saasfly/api/transformer": resolve(
        __dirname,
        "./packages/api/src/transformer.ts",
      ),
      "@saasfly/api": resolve(__dirname, "./packages/api"),
      "~": resolve(__dirname, "./apps/nextjs/src"),
    },
  },
});
