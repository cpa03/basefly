/**
 * Root ESLint Configuration
 *
 * Extends the base tooling/eslint-config to ensure consistent linting
 * across the entire monorepo. This file serves as the root-level ESLint
 * configuration that individual packages can extend.
 *
 * Note: For monorepo structure, packages typically define their own ESLint
 * configs in package.json that extend @saasfly/eslint-config/base
 */
module.exports = {
  root: true,
  extends: ["@saasfly/eslint-config/base"],
  env: {
    es2022: true,
    node: true,
  },
  ignorePatterns: ["node_modules", ".next", "dist", ".turbo", "coverage"],
};
