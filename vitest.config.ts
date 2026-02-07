import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "apps/",
        "tooling/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/types/**",
        "**/index.ts",
      ],
    },
    include: ["packages/**/*.test.{ts,tsx}"],
    exclude: [
      "node_modules/",
      "apps/",
      "tooling/",
      "**/node_modules/**",
      "packages/**/node_modules/**",
    ],
    root: ".",
  },
  resolve: {
    alias: {
      "@saasfly/auth": resolve(__dirname, "./packages/auth"),
      "@saasfly/db": resolve(__dirname, "./packages/db"),
      "@saasfly/ui": resolve(__dirname, "./packages/ui"),
      "@saasfly/common": resolve(__dirname, "./packages/common"),
      "@saasfly/common/config/resilience": resolve(__dirname, "./packages/common/src/config/resilience.ts"),
      "@saasfly/common/config/ui": resolve(__dirname, "./packages/common/src/config/ui.ts"),
      "@saasfly/common/config/k8s": resolve(__dirname, "./packages/common/src/config/k8s.ts"),
      "@saasfly/common/config/pricing": resolve(__dirname, "./packages/common/src/config/pricing.ts"),
      "@saasfly/common/config/site": resolve(__dirname, "./packages/common/src/config/site.ts"),
      "@saasfly/stripe": resolve(__dirname, "./packages/stripe"),
      "@saasfly/api": resolve(__dirname, "./packages/api"),
    },
  },
});
