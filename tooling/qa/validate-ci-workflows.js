#!/usr/bin/env node
/**
 * CI Workflow Validator
 *
 * Validates GitHub Actions workflow files against the recommended pnpm pattern.
 * This script helps identify issues like those described in Issue #305.
 *
 * Usage: node tooling/qa/validate-ci-workflows.js
 */

const fs = require("fs");
const path = require("path");

const VALID_ACTION_VERSIONS = {
  "actions/checkout": "v4",
  "actions/setup-node": "v4",
  "actions/cache": "v4",
  "pnpm/action-setup": "v4",
};

const WORKFLOW_DIR = ".github/workflows";

function parseWorkflowFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.split("\n");
}

function validateActionVersion(line, lineNumber, filePath, issues) {
  for (const [action, validVersion] of Object.entries(VALID_ACTION_VERSIONS)) {
    const pattern = new RegExp(`uses:\\s*${action.replace(/\//g, "\\/")}@(.+)`);
    const match = line.match(pattern);
    if (match) {
      const version = match[1].trim();
      if (version !== validVersion) {
        const versionNum = parseInt(version.replace("v", ""));
        const validVersionNum = parseInt(validVersion.replace("v", ""));
        if (versionNum > validVersionNum) {
          issues.push({
            file: filePath,
            line: lineNumber + 1,
            type: "error",
            message: `Invalid action version: ${action}@${version}`,
            suggestion: `Use ${action}@${validVersion} instead`,
          });
        }
      }
    }
  }
}

function validatePackageManager(lines, filePath, issues) {
  const content = lines.join("\n");

  if (content.includes("npm ci")) {
    const lineNumber = lines.findIndex((l) => l.includes("npm ci"));
    issues.push({
      file: filePath,
      line: lineNumber + 1,
      type: "warning",
      message: "Using 'npm ci' instead of 'pnpm install --frozen-lockfile'",
      suggestion: "Replace 'npm ci' with 'pnpm install --frozen-lockfile'",
    });
  }

  if (content.includes("cache: 'npm'") || content.includes('cache: "npm"')) {
    const lineNumber = lines.findIndex(
      (l) => l.includes("cache: 'npm'") || l.includes('cache: "npm"'),
    );
    issues.push({
      file: filePath,
      line: lineNumber + 1,
      type: "warning",
      message: "Using npm cache instead of pnpm cache",
      suggestion: "Replace \"cache: 'npm'\" with \"cache: 'pnpm'\"",
    });
  }

  if (content.includes("package-lock.json")) {
    const lineNumber = lines.findIndex((l) => l.includes("package-lock.json"));
    issues.push({
      file: filePath,
      line: lineNumber + 1,
      type: "warning",
      message: "Using package-lock.json in cache key",
      suggestion: "Replace 'package-lock.json' with 'pnpm-lock.yaml'",
    });
  }

  if (content.includes("~/.npm")) {
    const lineNumber = lines.findIndex((l) => l.includes("~/.npm"));
    issues.push({
      file: filePath,
      line: lineNumber + 1,
      type: "warning",
      message: "Using ~/.npm cache path",
      suggestion: "Replace '~/.npm' with '~/.local/share/pnpm/store'",
    });
  }

  const hasPnpmSetup = content.includes("pnpm/action-setup");
  const hasNpmCi = content.includes("npm ci");

  if (hasNpmCi && !hasPnpmSetup) {
    issues.push({
      file: filePath,
      type: "warning",
      message: "Missing pnpm/action-setup step",
      suggestion:
        "Add pnpm/action-setup@v4 step before actions/setup-node for proper pnpm support",
    });
  }
}

function validateWorkflows() {
  const issues = [];
  const workflowPath = path.join(process.cwd(), WORKFLOW_DIR);

  if (!fs.existsSync(workflowPath)) {
    console.log(`No workflow directory found at ${workflowPath}`);
    return issues;
  }

  const workflowFiles = fs
    .readdirSync(workflowPath)
    .filter((f) => f.endsWith(".yml"));

  for (const file of workflowFiles) {
    const filePath = path.join(workflowPath, file);
    const lines = parseWorkflowFile(filePath);

    lines.forEach((line, index) => {
      validateActionVersion(line, index, filePath, issues);
    });

    validatePackageManager(lines, filePath, issues);
  }

  return issues;
}

function main() {
  console.log("CI Workflow Validator\n");
  console.log(
    "Validating GitHub Actions workflows against recommended pnpm pattern...\n",
  );

  const issues = validateWorkflows();

  if (issues.length === 0) {
    console.log("All workflow files are valid!\n");
    return;
  }

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");

  console.log(
    `Found ${errors.length} error(s) and ${warnings.length} warning(s):\n`,
  );

  const byFile = issues.reduce((acc, issue) => {
    const file = issue.file;
    if (!acc[file]) acc[file] = [];
    acc[file].push(issue);
    return acc;
  }, {});

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`${file}`);
    for (const issue of fileIssues) {
      const icon = issue.type === "error" ? "ERROR" : "WARN";
      const lineInfo = issue.line ? `:${issue.line}` : "";
      console.log(`  [${icon}] Line${lineInfo}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`       Suggestion: ${issue.suggestion}`);
      }
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.log(
      "\nValidation failed with errors. Please fix the issues above.",
    );
    process.exit(1);
  } else {
    console.log(
      "\nValidation passed with warnings. Consider addressing the warnings above.",
    );
  }
}

main();
