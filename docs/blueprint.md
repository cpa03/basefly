# Data Blueprint

## Current Architecture Overview

This document outlines the current data architecture and design patterns for the Basefly platform (also known as Saasfly in the codebase as @saasfly/* packages).

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

#### Type Safety Improvements
```typescript
import { db } from "@saasfly/db";
import { k8sClusterService, userDeletionService } from "@saasfly/db";

// SoftDeleteService uses generic type parameter for table names
// T extends keyof DB ensures only valid table names are used
const clusters = await k8sClusterService.findAllActive(userId);

// UserDeletionService uses typed table names
// All table names are type-checked against DB schema
await userDeletionService.deleteUser(userId);

// Direct queries are fully type-safe
const user = await db
  .selectFrom("User")
  .select(["id", "name", "email"])
  .where("id", "=", userId)
  .executeTakeFirst();
```

**Type Safety Features**:
- Table names validated against DB schema at compile time
- Column names auto-completed and type-checked
- Query results typed with correct field types
- Generic type parameters ensure type consistency
- Minimal "as any" usage (limited to Kysely `.set()` limitations)

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

### ~~6. Type Safety Issues~~ ✅ RESOLVED
**Location**: `packages/db/soft-delete.ts`, `packages/db/user-deletion.ts`
**Issue**: Excessive use of "as any" type assertions in database operations
**Impact**: Loss of type safety, potential runtime errors not caught at compile time
**Priority**: High
**Status**: Refactored to use proper Kysely generics with `keyof DB` type constraints. Removed 8 instances of "as any" from table name references. Remaining 5 instances limited to `.set()` calls (Kysely type system limitation).

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

## Integration Patterns

### External Service Integration

#### Stripe Integration

**Location**: `packages/stripe/src/`

**Architecture**:
- **Retry with Exponential Backoff**: All Stripe API calls wrapped in retry logic
- **Timeouts**: 30-second timeout on all operations
- **Circuit Breaker**: Prevents cascading failures when Stripe is unavailable
- **Idempotency**: Keys ensure safe retries without duplicate charges

**Resilience Features**:

1. **Circuit Breaker Pattern**
   ```typescript
   const stripeCircuitBreaker = new CircuitBreaker("Stripe", 5, 60000);
   ```
   - Opens after 5 consecutive failures
   - Resets after 60 seconds
   - Fails fast when open

2. **Retry Logic**
   ```typescript
   withRetry(fn, {
     maxAttempts: 3,
     baseDelay: 1000,  // 1 second
     maxDelay: 10000,   // 10 seconds
   })
   ```
   - Exponential backoff: 1s, 2s, 4s
   - Retries only on transient errors (network, timeout, rate limits)

3. **Timeout Protection**
   ```typescript
   withTimeout(promise, 30000, "Operation timed out")
   ```
   - 30-second default timeout
   - Throws IntegrationError on timeout

4. **Idempotency Keys**
   ```typescript
   createCheckoutSession(params, `checkout_${userId}_${planId}`)
   ```
   - Prevents duplicate charges
   - Safe retry without side effects

**Error Handling**:
- `IntegrationError` for all integration failures
- `CircuitBreakerOpenError` when circuit is open
- Standardized error responses via `handleIntegrationError`
- Webhook errors prevent retries only for unrecoverable issues

**Usage Example**:
```typescript
import { createBillingSession, createCheckoutSession } from "@saasfly/stripe";

// Safe Stripe call with all resilience patterns
const session = await createCheckoutSession(
  {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    // ... other params
  },
  `checkout_${userId}_${planId}`, // Idempotency key
);
```

#### Error Response Standardization

**Location**: `packages/api/src/errors.ts`

**Error Codes**:
- `BAD_REQUEST` - Invalid input
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - No permission
- `NOT_FOUND` - Resource missing
- `CONFLICT` - Resource conflict
- `VALIDATION_ERROR` - Data validation failed
- `INTEGRATION_ERROR` - External service error
- `TIMEOUT_ERROR` - Operation timeout
- `CIRCUIT_BREAKER_OPEN` - Service unavailable
- `INTERNAL_SERVER_ERROR` - Unexpected error

**API Response Format**:
```typescript
interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}
```

**Usage in Routes**:
```typescript
import { createApiError, ErrorCode } from "../errors";

throw createApiError(
  ErrorCode.NOT_FOUND,
  "Cluster not found"
);
```

### Resilience Patterns Summary

| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| **Circuit Breaker** | Stop calling failing services | `CircuitBreaker` class |
| **Retry with Backoff** | Handle transient failures | `withRetry()` function |
| **Timeouts** | Prevent hanging calls | `withTimeout()` function |
| **Idempotency** | Safe retry without side effects | Stripe idempotency keys |
| **Error Standardization** | Consistent error handling | `ErrorCode` enum + `createApiError()` |

### Integration Best Practices

1. **Always Wrap External Calls**:
   - Use `safeStripeCall()` for Stripe operations
   - Never call external services directly in routes

2. **Set Timeouts**:
   - All external calls must have timeouts
   - Default: 30 seconds for Stripe

3. **Implement Retries**:
   - Retry on transient failures (network, timeouts)
   - Use exponential backoff
   - Limit retry attempts (default: 3)

4. **Use Circuit Breakers**:
   - Prevent cascading failures
   - Fail fast when service is down
   - Auto-recover after timeout

5. **Idempotency is Critical**:
   - All write operations must be idempotent
   - Use idempotency keys for Stripe
   - Design database operations to be retry-safe

6. **Standardize Errors**:
   - Use `createApiError()` for all errors
   - Return consistent error codes
   - Include helpful error messages

7. **Webhook Reliability**:
   - Handle errors gracefully
   - Log all webhook failures
   - Only throw for unrecoverable errors
   - Use `IntegrationError` for retryable issues

### Anti-Patterns to Avoid

❌ **Never**:
- Call external services without timeouts
- Retry indefinitely without limits
- Let external failures cascade to users
- Expose internal error details to clients
- Skip idempotency for payment operations
- Use infinite loops for retries

## Recommendations

### High Priority
1. ~~Add foreign key constraints to User table~~ ✅ Completed
2. ~~Implement proper migration strategy~~ ✅ Completed
3. ~~Add cascade delete policies~~ ✅ Completed
4. ~~Implement integration hardening~~ ✅ Completed
5. ~~Improve type safety - Remove "as any" type assertions~~ ✅ Completed

### Medium Priority
1. ~~Implement proper soft delete pattern with partial unique indexes~~ ✅ Completed
2. ~~Clarify unique constraint strategy for clusters~~ ✅ Completed
3. ~~Standardize error responses~~ ✅ Completed
4. Add data validation at application boundary
5. Add rate limiting for API endpoints
6. Implement request ID tracking for distributed tracing

### Low Priority
1. Audit query patterns for N+1 issues
2. Consider adding composite indexes for multi-column queries
3. Implement read replicas if read-heavy workload
4. Add integration tests for external services
5. Set up monitoring for circuit breaker states

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
