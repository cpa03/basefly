#NOTE

##FAQ
if you found can't generate prisma types, please use bun i -g prisma-kysely

---

# Migration Guide

This document outlines the proper migration workflow for the Basefly platform using Prisma Migrate.

## Overview

We use **Prisma Migrate** for production-safe schema changes, replacing the previous `prisma db push` approach which is not suitable for production environments.

## Migration Commands

### Development Workflow

```bash
# Create a new migration (and apply it to dev database)
bun db:migrate:dev

# Create migration only (without applying)
bun db:migrate:create

# Reset database and reapply all migrations
bun db:migrate:reset
```

### Production Workflow

```bash
# Apply pending migrations to production database
bun db:migrate:deploy

# Generate Prisma Client/Kysely types
bun db:generate
```

### Utility Commands

```bash
# View database in Prisma Studio
bun db:studio

# Resolve a failed migration
bun db:migrate:resolve

# Format schema file
bun prisma format
```

## Creating a Migration

### Step 1: Modify Schema

Edit `packages/db/prisma/schema.prisma` to make your changes:

```prisma
model Example {
  id    Int    @id @default(autoincrement())
  name  String
  // Add new fields, relations, etc.
}
```

### Step 2: Create Migration

```bash
cd packages/db
bun db:migrate:dev --name descriptive_migration_name
```

This will:

- Generate the migration SQL file
- Apply it to your development database
- Update the `_prisma_migrations` table

### Step 3: Review Generated SQL

Review the generated migration file in `prisma/migrations/`:

```sql
-- Migration: 20240107_descriptive_migration_name

-- AlterTable
ALTER TABLE "Example" ADD COLUMN "newField" TEXT;
```

### Step 4: Test Locally

Verify the changes work correctly:

- Run your application
- Test affected features
- Check for data integrity issues

### Step 5: Commit Migration

Commit both the schema and migration files:

```bash
git add packages/db/prisma/
git commit -m "feat: add new field to Example model"
```

## Applying Migrations to Production

### Pre-deployment Checklist

- [ ] All migrations tested in development
- [ ] Migration files reviewed and committed
- [ ] Database backup created
- [ ] Rollback procedure documented
- [ ] Staging environment tested (if available)

### Deployment Steps

1. **Backup Database**

   ```bash
   # Create backup using your database provider's tools
   # Example for PostgreSQL:
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Deploy Application Code**
   Deploy your application code (including migration files)

3. **Apply Migrations**

   ```bash
   cd packages/db
   bun db:migrate:deploy
   ```

4. **Generate Types**

   ```bash
   bun db:generate
   ```

5. **Verify Deployment**
   - Check logs for errors
   - Test critical functionality
   - Monitor database metrics

## Rollback Procedure

### Option 1: Create Reverse Migration

If you need to revert changes, create a new migration that reverses the previous one:

```bash
# Create reverse migration
bun db:migrate:dev --name reverse_descriptive_migration_name
```

Example reverse migration:

```sql
-- Reverts previous migration
ALTER TABLE "Example" DROP COLUMN "newField";
```

### Option 2: Restore from Backup

If rollback is urgent and migration cannot be reversed:

```bash
# Stop application
# Restore database from backup
psql $DATABASE_URL < backup_20240107_120000.sql
```

### Option 3: Manual Migration Resolution

If a migration fails during deployment:

```bash
# Mark migration as resolved (applied or rolled back)
bun db:migrate:resolve --applied <migration-name>
# or
bun db:migrate:resolve --rolled-back <migration-name>
```

## Migration Best Practices

### 1. Descriptive Migration Names

Use clear, descriptive names:

- ✅ `add_user_email_verified_index`
- ✅ `add_customer_stripe_integration`
- ❌ `update_schema`
- ❌ `changes`

### 2. Non-Destructive Changes

Prefer adding over modifying when possible:

- ✅ Add new column
- ✅ Add new table
- ✅ Add new index
- ⚠️ Modify column type (requires data migration)
- ❌ Drop column (data loss)
- ❌ Drop table (data loss)

### 3. Data Migrations

For complex data changes, separate schema and data migrations:

```sql
-- Step 1: Add new column
ALTER TABLE "Example" ADD COLUMN "newField" TEXT DEFAULT NULL;

-- Step 2: Migrate data (in separate migration or application code)
UPDATE "Example" SET "newField" = "oldField" WHERE "newField" IS NULL;

-- Step 3: Remove old column (after validation)
ALTER TABLE "Example" DROP COLUMN "oldField";
```

### 4. Batch Large Operations

For large tables, batch operations to avoid long locks:

```sql
-- Batch update with WHERE clause
UPDATE "Example" SET "newField" = 'value'
WHERE id BETWEEN 1 AND 1000;

-- Repeat for subsequent batches
```

### 5. Test with Realistic Data

Test migrations with realistic data volumes:

- Use production-like data sets
- Test on staging environment
- Monitor performance impact

## Migration File Structure

```
prisma/
├── schema.prisma              # Current schema definition
├── migration_lock.toml       # Prisma migration lock file
└── migrations/
    ├── 20240107_initial_migration/
    │   └── migration.sql       # Migration SQL
    ├── 20240107_add_foreign_key_constraints/
    │   ├── migration.sql       # Migration SQL
    │   └── rollback.sql        # Rollback SQL (optional)
    └── ...
```

## Troubleshooting

### Migration Fails to Apply

1. Check database connection
2. Verify PostgreSQL version compatibility
3. Review migration SQL for syntax errors
4. Check for conflicting constraints

### Schema Drift Detected

If `prisma migrate deploy` detects schema drift:

```bash
# Option 1: Reset (development only)
bun db:migrate:reset

# Option 2: Create baseline migration
bun db:migrate:dev --name baseline_existing_schema
```

### Foreign Key Errors

When adding foreign keys with existing data:

```sql
-- Option 1: Clean up orphaned records first
DELETE FROM "ChildTable"
WHERE "parentId" NOT IN (SELECT id FROM "ParentTable");

-- Option 2: Add constraint with NOT VALID, then validate
ALTER TABLE "ChildTable"
ADD CONSTRAINT "fk_name"
FOREIGN KEY ("parentId")
REFERENCES "ParentTable"("id")
NOT VALID;

ALTER TABLE "ChildTable" VALIDATE CONSTRAINT "fk_name";
```

## CI/CD Integration

### Example GitHub Action

```yaml
name: Database Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install
        working-directory: ./packages/db

      - name: Run migrations
        run: bun db:migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        working-directory: ./packages/db

      - name: Generate types
        run: bun db:generate
        working-directory: ./packages/db
```

## References

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

## Current Migration History

| Date       | Migration                                         | Description                                                                                     |
| ---------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2026-02-18 | `20260218_add_partial_indexes_for_cluster_status` | Added partial indexes for K8sClusterConfig query optimization (active/deleted clusters)         |
| 2026-02-18 | `20260218_add_webhook_event_type_index`           | Added index on StripeWebhookEvent.eventType for query performance                               |
| 2026-01-31 | `20260131_add_row_level_security`                 | Added row-level security (RLS) for multi-tenant data protection                                 |
| 2026-01-31 | `20260131_add_automated_triggers`                 | Added database triggers for automated maintenance (updatedAt updates, user soft delete cascade) |
| 2026-01-31 | `20260131_add_check_constraints`                  | Added check constraints for data integrity (name/location length, Stripe ID formats)            |
| 2026-01-10 | `20260110_add_composite_indexes`                  | Added composite indexes for query performance optimization                                      |
| 2024-01-07 | `20240107_implement_soft_delete`                  | Implemented soft delete pattern with deletedAt timestamp and partial unique indexes             |
| 2024-01-07 | `20240107_add_foreign_key_constraints`            | Added foreign key constraints to Customer and K8sClusterConfig tables                           |
