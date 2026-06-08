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
      ],
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
      "@saasfly/ui/skeleton": resolve(__dirname, "./packages/ui/src/skeleton.tsx"),
      "@saasfly/ui/button": resolve(__dirname, "./packages/ui/src/button.tsx"),
      "@saasfly/ui/dialog": resolve(__dirname, "./packages/ui/src/dialog.tsx"),
      "@saasfly/ui/dropdown-menu": resolve(
        __dirname,
        "./packages/ui/src/dropdown-menu.tsx",
      ),
      "@saasfly/ui/tooltip": resolve(__dirname, "./packages/ui/src/tooltip.tsx"),
      "@saasfly/ui/table": resolve(__dirname, "./packages/ui/src/table.tsx"),
      "@saasfly/ui/avatar": resolve(__dirname, "./packages/ui/src/avatar.tsx"),
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
      "@saasfly/common": resolve(__dirname, "./packages/common"),
      "@saasfly/stripe": resolve(__dirname, "./packages/stripe"),
      "@saasfly/api": resolve(__dirname, "./packages/api"),
      "~": resolve(__dirname, "./apps/nextjs/src"),
    },
  },
});
