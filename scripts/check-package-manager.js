#!/usr/bin/env node

/**
 * Package Manager Guard (issue #579)
 *
 * Runs as the `preinstall` hook. Fails fast with clear, actionable
 * instructions when the repository is installed with a package manager
 * other than pnpm (e.g. `npm install`), which would otherwise produce the
 * cryptic `sh: 1: pnpm: not found` error later.
 *
 * Passes silently when pnpm (or Corepack-managed pnpm) is used.
 */

const npmExecPath = process.env.npm_execpath || "";

if (!/pnpm/.test(npmExecPath)) {
  // eslint-disable-next-line no-console
  console.error(
    [
      "❌ This repository must be installed with pnpm (not npm/yarn).",
      "",
      "📦 Install pnpm:",
      "   - macOS/Linux:  curl -fsSL https://get.pnpm.io/install.sh | sh -",
      "   - Windows:      npm install -g pnpm",
      "   - Corepack:     corepack enable && corepack prepare pnpm@latest --activate",
      "",
      "📋 Required version: pnpm 10.x (see \"packageManager\" in package.json)",
      "   Recommended Node version: see .nvmrc",
      "",
      "Then run:",
      "   pnpm install",
    ].join("\n"),
  );
  process.exit(1);
}

process.exit(0);
