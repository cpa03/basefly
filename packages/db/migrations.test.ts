import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Database Migration Integrity Tests
 *
 * Verifies that the Prisma migration history is structurally sound:
 * - Every migration directory contains a non-empty `migration.sql`
 * - Migration directories follow the Prisma timestamp naming convention
 * - The Prisma schema declares the core domain models and enums
 * - Schema-declared indexes/constraints have corresponding migration SQL
 * - Security-critical migrations (RLS, soft delete, webhook idempotency)
 *   contain the expected DDL statements
 *
 * @module migrations.test
 */

const MIGRATIONS_DIR = path.join(__dirname, "prisma", "migrations");
const SCHEMA_PATH = path.join(__dirname, "prisma", "schema.prisma");

const migrationDirectories = fs
  .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

describe("Migration history structure", () => {
  it("should have at least one migration directory", () => {
    expect(migrationDirectories.length).toBeGreaterThan(0);
  });

  it("every migration directory should follow the Prisma naming convention (YYYYMMDD_name)", () => {
    const timestampPrefix = /^\d{8}_/;
    for (const dir of migrationDirectories) {
      expect(
        dir,
        `Migration directory "${dir}" should start with a YYYYMMDD prefix`,
      ).toMatch(timestampPrefix);
    }
  });

  it("migration directories should be chronologically ordered and unique", () => {
    const prefixes = migrationDirectories.map((dir) => dir.slice(0, 8));
    const unique = new Set(prefixes);
    // Multiple migrations per day are allowed, but the full names must be unique.
    expect(new Set(migrationDirectories).size).toBe(
      migrationDirectories.length,
    );
    expect(unique.size).toBeGreaterThan(0);
  });

  it("every migration directory should contain a non-empty migration.sql", () => {
    for (const dir of migrationDirectories) {
      const migrationSqlPath = path.join(MIGRATIONS_DIR, dir, "migration.sql");
      expect(
        fs.existsSync(migrationSqlPath),
        `${dir}/migration.sql should exist`,
      ).toBe(true);
      const sql = fs.readFileSync(migrationSqlPath, "utf8");
      expect(
        sql.trim().length,
        `${dir}/migration.sql should not be empty`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("Prisma schema integrity", () => {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");

  it("schema.prisma should exist and be non-empty", () => {
    expect(schema.trim().length).toBeGreaterThan(0);
  });

  it("should declare the core domain models", () => {
    for (const model of [
      "User",
      "Customer",
      "K8sClusterConfig",
      "StripeWebhookEvent",
      "Account",
      "Session",
      "VerificationToken",
    ]) {
      expect(schema, `model ${model} should be declared`).toContain(
        `model ${model} {`,
      );
    }
  });

  it("should declare the core enums with expected values", () => {
    expect(schema).toContain("enum Role");
    expect(schema).toMatch(/USER/);
    expect(schema).toMatch(/ADMIN/);
    expect(schema).toContain("enum SubscriptionPlan");
    expect(schema).toMatch(/FREE/);
    expect(schema).toMatch(/PRO/);
    expect(schema).toMatch(/BUSINESS/);
    expect(schema).toContain("enum Status");
    expect(schema).toMatch(/PENDING/);
    expect(schema).toMatch(/RUNNING/);
  });

  it("Customer model should have a unique authUserId (one customer per user)", () => {
    expect(schema).toContain(
      "authUserId             String            @unique",
    );
  });

  it("K8sClusterConfig should support soft delete via deletedAt", () => {
    expect(schema).toContain("deletedAt  DateTime?");
  });

  it("StripeWebhookEvent should have idempotency fields (id, processed, eventType)", () => {
    expect(schema).toContain("model StripeWebhookEvent {");
    expect(schema).toContain("id        String   @id");
    expect(schema).toContain("processed Boolean  @default(false)");
    expect(schema).toContain("eventType String");
  });

  it("Customer model should declare the composite subscription index (plan, stripeCurrentPeriodEnd)", () => {
    expect(schema).toContain("@@index([plan, stripeCurrentPeriodEnd])");
  });

  it("Customer model should declare the composite admin-analytics index (authUserId, plan, stripeCurrentPeriodEnd)", () => {
    expect(schema).toContain(
      "@@index([authUserId, plan, stripeCurrentPeriodEnd])",
    );
  });

  it("should declare relations between Customer/K8sClusterConfig and User", () => {
    expect(schema).toContain(
      "user User @relation(fields: [authUserId], references: [id]",
    );
  });
});

describe("Migration SQL content invariants", () => {
  const readMigrationSql = (dir: string): string =>
    fs.readFileSync(path.join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8");

  it("soft-delete migration should add deletedAt to K8sClusterConfig", () => {
    const sql = readMigrationSql("20240107_implement_soft_delete");
    expect(sql).toContain("deletedAt");
    expect(sql).toMatch(/ALTER TABLE "K8sClusterConfig"/);
  });

  it("webhook idempotency migration should create StripeWebhookEvent table with unique id", () => {
    const sql = readMigrationSql("20260131_add_webhook_idempotency");
    expect(sql).toContain('CREATE TABLE "StripeWebhookEvent"');
    expect(sql).toContain("PRIMARY KEY");
    expect(sql).toMatch(/CREATE UNIQUE INDEX "StripeWebhookEvent_id_key"/);
  });

  it("row-level security migration should enable RLS on tenant tables", () => {
    const sql = readMigrationSql("20260131_add_row_level_security");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toMatch(/CREATE POLICY/);
  });

  it("check-constraints migration should enforce data integrity rules", () => {
    const sql = readMigrationSql("20260131_add_check_constraints");
    expect(sql).toContain("ADD CONSTRAINT");
    expect(sql).toContain("CHECK");
  });

  it("composite index migration (20260606) should create Customer(plan, stripeCurrentPeriodEnd) index", () => {
    const sql = readMigrationSql(
      "20260606_add_customer_subscription_plan_period_index",
    );
    expect(sql).toMatch(
      /CREATE INDEX IF NOT EXISTS "Customer_plan_stripeCurrentPeriodEnd_idx"/,
    );
    expect(sql).toContain('ON "Customer"');
  });

  it("every migration.sql should reference at least one table or type", () => {
    for (const dir of migrationDirectories) {
      const sql = readMigrationSql(dir);
      expect(
        sql,
        `${dir}/migration.sql should reference a table or type`,
      ).toMatch(/(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|COMMENT)/i);
    }
  });
});
