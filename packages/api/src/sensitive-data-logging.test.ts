/**
 * Security Test: Sensitive Data in Logs
 *
 * This test scans the codebase to ensure no sensitive data is being logged.
 * It checks for common patterns that could leak PII, credentials, or secrets.
 *
 * @security - Prevents accidental logging of sensitive information
 */

import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";

describe("Security: No Sensitive Data in Logs", () => {
  const SENSITIVE_PATTERNS = [
    // Authentication/Authorization
    { pattern: /password/i, name: "password" },
    { pattern: /secret/i, name: "secret" },
    { pattern: /token(?!Id)/i, name: "token" },
    { pattern: /api_?key/i, name: "API key" },
    { pattern: /private_?key/i, name: "private key" },
    { pattern: /access_?token/i, name: "access token" },
    { pattern: /refresh_?token/i, name: "refresh token" },
    { pattern: /bearer/i, name: "bearer token" },
    { pattern: /authorization/i, name: "authorization" },

    // Clerk-specific
    { pattern: /clerk.*secret/i, name: "Clerk secret" },
    { pattern: /CLERK_SECRET_KEY/i, name: "CLERK_SECRET_KEY" },

    // Stripe-specific
    { pattern: /stripe.*key/i, name: "Stripe key" },
    { pattern: /STRIPE_SECRET_KEY/i, name: "STRIPE_SECRET_KEY" },
    { pattern: /sk_live_|sk_test_/i, name: "Stripe secret key pattern" },

    // Database
    { pattern: /database.*url/i, name: "database URL" },
    { pattern: /postgres.*url/i, name: "Postgres URL" },

    // PII
    { pattern: /ssn|social.*security/i, name: "SSN" },
    { pattern: /credit.*card|card.*number/i, name: "credit card" },
    { pattern: /cvv/i, name: "CVV" },

    // Environment
    { pattern: /\.env/i, name: ".env reference" },
  ];

  const EXCLUDED_PATHS = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
  ];

  const EXCLUDED_FILES = [
    "sensitive-data-logging.test.ts",
    "security-audit.test.ts",
  ];

  function shouldExclude(filePath: string): boolean {
    return EXCLUDED_PATHS.some((excluded) =>
      filePath.includes(path.sep + excluded + path.sep),
    );
  }

  function getSourceFiles(dir: string): string[] {
    const files: string[] = [];

    if (shouldExclude(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !shouldExclude(fullPath)) {
        files.push(...getSourceFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
      ) {
        if (!EXCLUDED_FILES.includes(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  it("should not log sensitive data in logger calls", () => {
    const apiDir = path.join(process.cwd(), "packages", "api", "src");

    if (!fs.existsSync(apiDir)) {
      // Skip if API package doesn't exist
      return;
    }

    const sourceFiles = getSourceFiles(apiDir);
    const violations: {
      file: string;
      line: number;
      sensitiveName: string;
      context: string;
    }[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const lineNumber = i + 1;

        // Skip comments
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          continue;
        }

        // Check each sensitive pattern
        for (const { pattern, name } of SENSITIVE_PATTERNS) {
          if (pattern.test(line)) {
            // Check if it's in a logger call (security concern) or just a variable name/import
            const isInLoggerCall =
              line.includes("logger.") || line.includes("console.");

            // If it's in a log call, it's a violation
            if (isInLoggerCall) {
              violations.push({
                file: path.relative(process.cwd(), filePath),
                line: lineNumber,
                sensitiveName: name,
                context: line.trim().substring(0, 100),
              });
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      const message = violations
        .map(
          (v) =>
            `\n  - ${v.file}:${v.line} - ${v.sensitiveName}\n    ${v.context}`,
        )
        .join("");

      throw new Error(
        `Found ${violations.length} potential sensitive data logging(s):${message}\n\n` +
          "Do NOT log passwords, secrets, tokens, API keys, or PII in logger calls.",
      );
    }
  });

  it("should not log sensitive data in console calls (development)", () => {
    const apiDir = path.join(process.cwd(), "packages", "api", "src");

    if (!fs.existsSync(apiDir)) {
      return;
    }

    const sourceFiles = getSourceFiles(apiDir);
    const violations: {
      file: string;
      line: number;
      context: string;
    }[] = [];

    // More strict check for console calls
    const strictPatterns = [
      /password/i,
      /secret/i,
      /api_?key/i,
      /sk_live_|sk_test_/i,
      /CLERK_SECRET_KEY/i,
      /STRIPE_SECRET_KEY/i,
    ];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const lineNumber = i + 1;

        // Skip test files
        if (line.includes(".test.") || line.includes(".spec.")) {
          continue;
        }

        if (line.includes("console.")) {
          for (const pattern of strictPatterns) {
            if (pattern.test(line)) {
              violations.push({
                file: path.relative(process.cwd(), filePath),
                line: lineNumber,
                context: line.trim().substring(0, 100),
              });
              break;
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      const message = violations
        .map((v) => `\n  - ${v.file}:${v.line}\n    ${v.context}`)
        .join("");

      throw new Error(
        `Found ${violations.length} potential sensitive data in console calls(s):${message}\n\n` +
          "Remove or sanitize any sensitive data before logging.",
      );
    }
  });
});
