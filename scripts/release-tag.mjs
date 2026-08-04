#!/usr/bin/env node
/**
 * release-tag.mjs — Release verification gate and annotated tag creation.
 *
 * Usage:
 *   node scripts/release-tag.mjs            # verify + create annotated tag v<version>
 *   node scripts/release-tag.mjs --dry-run  # run all structural checks, print plan, create nothing
 *   node scripts/release-tag.mjs --skip-verify  # skip pnpm dx:check gate (HOTFIX ONLY)
 *
 * What it does:
 *   1. Reads the version from the root package.json (`version` field).
 *   2. Fails if the working tree has uncommitted changes to tracked files
 *      (untracked files such as local harness state are ignored).
 *   3. Fails if the tag `v<version>` already exists.
 *   4. Fails if CHANGELOG.md has no `## [<version>]` entry (Keep a Changelog).
 *   5. Runs the full verification gate `pnpm dx:check`
 *      (typecheck + lint + test + security:audit + check-deps).
 *   6. Creates the annotated tag `v<version>`.
 *
 * Pushing the tag and the branch is intentionally left manual — see
 * docs/release-process.md for the full release procedure.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipVerify = args.includes("--skip-verify");

function fail(message) {
  console.error(`\n❌ release-tag: ${message}`);
  process.exit(1);
}

function git(argsList) {
  return execFileSync("git", argsList, { encoding: "utf8" }).trim();
}

console.log("🔖 Release tag script");
console.log("═════════════════════\n");

// 1. Version from package.json
const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf8"));
const version = pkg.version;
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`invalid version "${version}" in package.json (expected semver X.Y.Z)`);
}
const tagName = `v${version}`;
console.log(`Target tag: ${tagName}`);

// 2. Working tree must be clean for tracked files
let dirty;
try {
  dirty = git(["status", "--porcelain", "--untracked-files=no"]);
} catch {
  fail("could not inspect git status");
}
if (dirty) {
  fail(`working tree has uncommitted changes to tracked files:\n${dirty}`);
}
console.log("✅ Working tree clean (tracked files)");

// 3. Tag must not already exist
const existingTag = git(["tag", "-l", tagName]);
if (existingTag) {
  fail(`tag ${tagName} already exists — refusing to overwrite`);
}
console.log(`✅ Tag ${tagName} does not exist yet`);

// 4. CHANGELOG entry must exist for this version
const changelogPath = resolve(rootDir, "CHANGELOG.md");
if (!existsSync(changelogPath)) {
  fail("CHANGELOG.md not found at repository root");
}
const changelog = readFileSync(changelogPath, "utf8");
const escapedVersion = version.replace(/\./g, "\\.");
const entryPattern = new RegExp(`^## \\[${escapedVersion}\\][^\\[]*`, "m");
if (!entryPattern.test(changelog)) {
  fail(
    `CHANGELOG.md has no "## [${version}]" entry — add one (Keep a Changelog) before releasing`,
  );
}
console.log(`✅ CHANGELOG.md contains a [${version}] entry`);

// 5. Verification gate
if (dryRun) {
  console.log(
    "\nℹ️  --dry-run: structural checks passed. In real mode the gate " +
      "`pnpm dx:check` (typecheck + lint + test + security:audit + check-deps) " +
      "runs before the tag is created.",
  );
  console.log(`✅ DRY RUN complete — would create annotated tag: ${tagName}\n`);
  process.exit(0);
}

if (skipVerify) {
  console.log(
    "\n⚠️  --skip-verify: SKIPPING the verification gate — use ONLY for emergency hotfixes.",
  );
} else {
  console.log("\n🔍 Running verification gate: pnpm dx:check ...");
  try {
    execFileSync("pnpm", ["dx:check"], { stdio: "inherit" });
  } catch {
    fail(
      "verification gate failed (pnpm dx:check). Fix all issues before tagging. " +
        "Use --skip-verify only for emergency hotfixes with human sign-off.",
    );
  }
  console.log("✅ Verification gate passed");
}

// 6. Create the annotated tag
try {
  execFileSync("git", ["tag", "-a", tagName, "-m", `Release ${tagName}`], {
    stdio: "inherit",
  });
} catch {
  fail("failed to create tag (see git error above)");
}
console.log(`\n✅ Created annotated tag ${tagName}`);
console.log("Next steps (manual, per docs/release-process.md):");
console.log(`  git push origin ${tagName}`);
console.log("  git push origin main\n");
