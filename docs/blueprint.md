# Data Blueprint

## Current Architecture Overview

This document outlines the current data architecture and design patterns for the Basefly platform.

## Data Models

### Core Models

#### User (Authentication)
```prisma
model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()"))
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  customers     Customer[]
  k8sClusters   K8sClusterConfig[]
}
```
- **Purpose**: Core user authentication record
- **Storage**: PostgreSQL with UUID primary key
- **Index**: Unique constraint on `email`
- **Relations**: One-to-many with Customer and K8sClusterConfig

#### Account (OAuth Integration)
```prisma
model Account {
  id                String  @id @default(dbgenerated("gen_random_uuid()"))
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```
- **Purpose**: OAuth provider accounts (GitHub, Google, etc.)
- **Relationships**: Many-to-one with User (cascade delete)
- **Index**: Unique composite on [provider, providerAccountId]

#### Customer (Subscription & Billing)
```prisma
model Customer {
  id                     Int               @id @default(autoincrement())
  authUserId             String
  name                   String?
  plan                   SubscriptionPlan?
  stripeCustomerId       String?           @unique
  stripeSubscriptionId   String?           @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @default(now())

  user User @relation(fields: [authUserId], references: [id], onDelete: Restrict)

  @@index([authUserId])
}
```
- **Purpose**: Customer subscription and billing data
- **Integration**: Stripe webhooks update this table
- **Index**: Index on `authUserId`
- **Foreign Key**: `authUserId` references `User.id` (RESTRICT delete)
- **Cascade**: ON DELETE RESTRICT to prevent accidental data loss

#### K8sClusterConfig (Kubernetes Clusters)
```prisma
model K8sClusterConfig {
  id         Int               @id @default(autoincrement())
  name       String
  location   String
  authUserId String
  plan       SubscriptionPlan? @default(FREE)
  network    String?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @default(now())
  status     Status?           @default(PENDING)
  deletedAt  DateTime?

  user User @relation(fields: [authUserId], references: [id], onDelete: Restrict)

  @@index([authUserId])
  @@index([deletedAt])
}
```
- **Purpose**: Kubernetes cluster configurations
- **Soft Delete**: Uses `deletedAt` timestamp (NULL = active, non-NULL = deleted)
- **Index**: Indexes on `authUserId` and `deletedAt`
- **Partial Unique**: Index on [plan, authUserId] for active records only (via migration)
- **Foreign Key**: `authUserId` references `User.id` (RESTRICT delete)
- **Cascade**: ON DELETE RESTRICT to prevent accidental data loss
- **Helper**: `k8sClusterService` provides soft delete operations

## Enums

### SubscriptionPlan
- `FREE`: Basic access
- `PRO`: Enhanced features
- `BUSINESS`: Enterprise features

### Status (Cluster Status)
- `PENDING`: Initial state
- `CREATING`: Provisioning in progress
- `INITING`: Initialization phase
- `RUNNING`: Active and operational
- `STOPPED`: Paused state
- `DELETED`: Soft-deleted

## Data Access Layer

### Technology Stack
- **ORM**: Prisma (schema definition only)
- **Query Builder**: Kysely (type-safe SQL)
- **Database**: PostgreSQL

### Query Patterns

#### Kysely Usage Example
```typescript
const customer = await db
  .selectFrom("Customer")
  .select(["id", "plan", "stripeCustomerId"])
  .where("authUserId", "=", userId)
  .executeTakeFirst();
```

#### Relationship Queries
- Currently no join patterns observed
- Individual queries fetch related data separately

#### Soft Delete Pattern
```typescript
import { k8sClusterService } from "@saasfly/db";

// Find active clusters
const activeClusters = await k8sClusterService.findAllActive(userId);

// Soft delete a cluster
await k8sClusterService.softDelete(clusterId, userId);

// Restore a soft-deleted cluster
await k8sClusterService.restore(clusterId, userId);
```

## Current Issues & Anti-Patterns

### ~~1. Missing Foreign Key Constraints~~ ✅ RESOLVED
**Location**: `Customer.authUserId`, `K8sClusterConfig.authUserId`
**Issue**: Referential integrity not enforced at DB level
**Impact**: Orphaned records possible if User deleted
**Priority**: High
**Status**: Foreign key constraints added in migration 20240107_add_foreign_key_constraints

### 2. Lack of Migration Strategy
**Location**: No migration files
**Issue**: Using `prisma db push` instead of migrations
**Impact**: Not production-safe, no rollback capability
**Priority**: High

### ~~3. Soft Delete Inconsistency~~ ✅ RESOLVED
**Location**: `K8sClusterConfig.delete` flag
**Issue**: No unique index that excludes deleted records
**Impact**: Can't enforce uniqueness on active records
**Priority**: Medium
**Status**: Implemented proper soft delete pattern with `deletedAt` timestamp and partial unique indexes

### ~~4. Commented Unique Constraint~~ ✅ RESOLVED
**Location**: `K8sClusterConfig`
**Issue**: `@@unique([plan, authUserId])` commented out
**Impact**: Unclear if users should have multiple clusters per plan
**Priority**: Medium
**Status**: Implemented as **partial unique index** via migration. Business rule: Users can have one cluster per subscription plan (e.g., one FREE, one PRO, one BUSINESS).

### ~~5. No Cascade Delete Policies~~ ✅ RESOLVED
**Location**: Customer and K8sClusterConfig
**Issue**: No cascade delete to User table
**Impact**: Manual cleanup required when User deleted
**Priority**: Medium
**Status**: Implemented application-level cascade deletion with audit trail preservation. Database uses RESTRICT to prevent accidental deletion, `UserDeletionService` handles controlled cascade with transactions.

### 6. N+1 Query Potential
**Location**: Various router files
**Issue**: No evidence of using join queries
**Impact**: Potential performance issues with related data
**Priority**: Low (not currently observed)

## Index Analysis

### Current Indexes
| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| User | email | Unique | Email lookup |
| Account | [provider, providerAccountId] | Unique | OAuth lookup |
| Customer | authUserId | Index | User lookup |
| K8sClusterConfig | authUserId | Index | User lookup |
| Customer | stripeCustomerId | Unique | Stripe webhook |
| Customer | stripeSubscriptionId | Unique | Stripe webhook |

### Query Pattern Analysis
Based on router files:
- Most queries filter by `authUserId` → Indexed ✓
- Webhook lookups by Stripe IDs → Unique indexed ✓
- No observed composite index requirements

## Data Integrity

### Current State
- ✅ Unique constraints on critical fields
- ✅ Cascade delete for Auth relationships
- ✅ **Foreign keys to User table** (added 2024-01-07)
- ✅ **ON DELETE RESTRICT** prevents accidental data loss
- ✅ **Soft delete pattern implemented** with `deletedAt` timestamp (2024-01-07)
- ✅ **Partial unique indexes** for active records enforcement
- ✅ **Soft delete helper service** for consistent operations
- ✅ **Application-level cascade deletion** with audit trail preservation (2024-01-07)
- ✅ **Transaction-based user deletion** ensures data consistency
- ❌ No check constraints
- ❌ No triggers for automated cleanup

## Transaction Usage

### Current Patterns
- Individual operations in webhooks
- No observed multi-step transactions
- Stripe webhook handlers perform sequential updates

### User Deletion Strategy

We use a **controlled cascade deletion** approach that preserves audit trails:

1. **Database Level**: Foreign keys use `ON DELETE RESTRICT` to prevent accidental data loss
2. **Application Level**: `UserDeletionService` handles cascading deletes with proper soft delete
3. **Process Flow**:
   - Soft delete all related K8sClusterConfig records
   - Hard delete Customer records (after ensuring no outstanding billing)
   - Hard delete User record

```typescript
import { userDeletionService } from "@saasfly/db";

// Hard delete with cascade
await userDeletionService.deleteUser(userId);

// Soft delete user (keeps record for compliance)
await userDeletionService.softDeleteUser(userId);

// Get summary before deletion
const summary = await userDeletionService.getUserSummary(userId);
```

## Recommendations

### High Priority
1. ~~Add foreign key constraints to User table~~ ✅ Completed
2. ~~Implement proper migration strategy~~ ✅ Completed
3. ~~Add cascade delete policies~~ ✅ Completed

### Medium Priority
1. ~~Implement proper soft delete pattern with partial unique indexes~~ ✅ Completed
2. ~~Clarify unique constraint strategy for clusters~~ ✅ Completed
3. Add data validation at application boundary

### Low Priority
1. Audit query patterns for N+1 issues
2. Consider adding composite indexes for multi-column queries
3. Implement read replicas if read-heavy workload

## Future Considerations

### Scaling
- Consider read replicas for dashboard queries
- Partitioning for large tables (K8sClusterConfig)

### Performance
- Add connection pooling configuration
- Implement query result caching
- Consider materialized views for aggregations

### Security
- Row-level security for multi-tenant data
- Audit logging for sensitive operations
- Data encryption at rest
