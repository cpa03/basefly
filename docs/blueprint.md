# Data Blueprint

## Current Architecture Overview

This document outlines the current data architecture and design patterns for the Basefly platform (also known as Saasfly in the codebase as @saasfly/\* packages).

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
const customer = await db.selectFrom("Customer").select(["id", "plan", "stripeCustomerId"]).where("authUserId", "=", userId).executeTakeFirst();
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
import { db, k8sClusterService, userDeletionService } from "@saasfly/db";

// SoftDeleteService uses generic type parameter for table names
// T extends keyof DB ensures only valid table names are used
const clusters = await k8sClusterService.findAllActive(userId);

// UserDeletionService uses typed table names
// All table names are type-checked against DB schema
await userDeletionService.deleteUser(userId);

// Direct queries are fully type-safe
const user = await db.selectFrom("User").select(["id", "name", "email"]).where("id", "=", userId).executeTakeFirst();
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

### 7. N+1 Query Potential

**Location**: Various router files
**Issue**: No evidence of using join queries
**Impact**: Potential performance issues with related data
**Priority**: Low (not currently observed)

## Index Analysis

### Current Indexes

| Table            | Column(s)                            | Type           | Purpose                            |
| ---------------- | ------------------------------------ | -------------- | ---------------------------------- |
| User             | email                                | Unique         | Email lookup                       |
| Account          | [provider, providerAccountId]        | Unique         | OAuth lookup                       |
| Customer         | authUserId                           | Index          | User lookup                        |
| Customer         | plan                                 | Index          | Subscription tier filtering        |
| Customer         | [authUserId, stripeCurrentPeriodEnd] | Composite      | Subscription status checks         |
| K8sClusterConfig | authUserId                           | Index          | User lookup                        |
| K8sClusterConfig | deletedAt                            | Index          | Soft-delete filtering              |
| K8sClusterConfig | [authUserId, deletedAt]              | Composite      | Active/deleted cluster queries     |
| K8sClusterConfig | [plan, authUserId]                   | Partial Unique | One cluster per plan (active only) |
| Customer         | stripeCustomerId                     | Unique         | Stripe webhook                     |
| Customer         | stripeSubscriptionId                 | Unique         | Stripe webhook                     |

### Query Pattern Analysis

Based on router files:

- Most queries filter by `authUserId` → Indexed ✓
- Webhook lookups by Stripe IDs → Unique indexed ✓
- Composite indexes added for multi-column filter patterns (2026-01-10)

### Composite Index Details

#### K8sClusterConfig Indexes

1. **`[authUserId, deletedAt]` Composite Index**
   - **Purpose**: Optimize soft-delete queries for finding all active/deleted clusters
   - **Use Cases**:
     - `findAllActive(userId)` - List all active clusters for a user
     - `findDeleted(userId)` - List all deleted clusters for a user
     - `getUserSummary(userId)` - User deletion and audit operations
   - **Impact**: 5+ query locations benefit from this index

2. **`[plan, authUserId]` Partial Unique Index** (from soft delete migration)
   - **Purpose**: Enforce one cluster per subscription plan per user (active records only)
   - **Constraint**: `WHERE deletedAt IS NULL`
   - **Business Rule**: Users can have one FREE, one PRO, and one BUSINESS cluster

#### Customer Indexes

1. **`[authUserId, stripeCurrentPeriodEnd]` Composite Index**
   - **Purpose**: Optimize subscription status checks
   - **Use Cases**:
     - Customer queries by user ID
     - Subscription active/inactive status checks
   - **Impact**: 6+ query locations benefit from this index
   - **Order**: DESC on `stripeCurrentPeriodEnd` for efficient active subscription lookups

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
- ✅ **Check constraints for data validation** (added 2026-01-31)
- ✅ **Database triggers for automated maintenance** (added 2026-01-31)

### Check Constraints (2026-01-31)

**K8sClusterConfig Constraints:**

- `name_not_empty`: `LENGTH(TRIM(name)) > 0` - Ensures cluster names are not empty or whitespace
- `name_max_length`: `LENGTH(name) <= 100` - Limits cluster name length
- `location_not_empty`: `LENGTH(TRIM(location)) > 0` - Ensures locations are not empty or whitespace
- `location_max_length`: `LENGTH(location) <= 50` - Limits location length

**Customer Constraints:**

- `stripeCustomerId_format`: `stripeCustomerId IS NULL OR stripeCustomerId LIKE 'cus_%'` - Validates Stripe customer ID format
- `stripeSubscriptionId_format`: `stripeSubscriptionId IS NULL OR stripeSubscriptionId LIKE 'sub_%'` - Validates Stripe subscription ID format

**Benefits:**

- Database-level validation prevents invalid data insertion
- Complements application-level validation with last line of defense
- Minimal performance overhead on INSERT/UPDATE operations
- No impact on SELECT queries

**Migration:** `20260131_add_check_constraints`

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
     baseDelay: 1000, // 1 second
     maxDelay: 10000, // 10 seconds
   });
   ```

   - Exponential backoff: 1s, 2s, 4s
   - Retries only on transient errors (network, timeout, rate limits)

3. **Timeout Protection**

   ```typescript
   withTimeout(promise, 30000, "Operation timed out");
   ```

   - 30-second default timeout
   - Throws IntegrationError on timeout

4. **Idempotency Keys**

   ```typescript
   createCheckoutSession(params, `checkout_${userId}_${planId}`);
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

throw createApiError(ErrorCode.NOT_FOUND, "Cluster not found");
```

### Resilience Patterns Summary

| Pattern                   | Purpose                         | Implementation                        |
| ------------------------- | ------------------------------- | ------------------------------------- |
| **Circuit Breaker**       | Stop calling failing services   | `CircuitBreaker` class                |
| **Retry with Backoff**    | Handle transient failures       | `withRetry()` function                |
| **Timeouts**              | Prevent hanging calls           | `withTimeout()` function              |
| **Idempotency**           | Safe retry without side effects | Stripe idempotency keys               |
| **Error Standardization** | Consistent error handling       | `ErrorCode` enum + `createApiError()` |

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
   - **Idempotency**: Prevent duplicate processing with database tracking
   - **Event Registration**: Track all processed Stripe webhook events
   - **Duplicate Detection**: Unique constraint prevents reprocessing
   - **Cleanup Strategy**: Periodically delete old processed events (90 days)

**Webhook Idempotency Pattern**:

Stripe webhooks may be delivered multiple times due to:

- Network interruptions
- Timeouts during processing
- Manual retry by Stripe

**Implementation**: `packages/db/webhook-idempotency.ts`

**Database Schema**: `StripeWebhookEvent`

```sql
CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventType" TEXT NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("id")  -- Prevents duplicate events
);
```

**Usage Pattern**:

```typescript
import { executeIdempotentWebhook } from "@saasfly/db/webhook-idempotency";

export async function handleEvent(event: Stripe.Event) {
  await executeIdempotentWebhook(
    event.id, // Stripe event ID (evt_*)
    event.type, // Event type (e.g., checkout.session.completed)
    async () => processEventInternal(event), // Handler function
  );
}
```

**Idempotency Workflow**:

1. Webhook received with `event.id`
2. Attempt to insert into `StripeWebhookEvent` table
3. If unique constraint violation → event already processed → skip handler
4. If insert succeeds → proceed to process event
5. Mark `processed = true` after successful completion
6. On error, throw to trigger Stripe retry (if retryable)

**Key Functions**:

- `executeIdempotentWebhook()` - Execute handler with idempotency protection
- `registerWebhookEvent()` - Register event (fails if duplicate)
- `markEventAsProcessed()` - Mark event as successfully processed
- `hasEventBeenProcessed()` - Check if event was processed
- `cleanupOldWebhookEvents()` - Delete old processed events

**Error Handling**:

- Duplicate key violation (code 23505) → Silently skip (already processed)
- Other database errors → Throw IntegrationError (retryable)
- Handler errors → Propagate (Stripe will retry)

**Benefits**:

- ✅ Prevents duplicate database updates
- ✅ Prevents duplicate charges on checkout events
- ✅ Provides audit trail of all processed webhooks
- ✅ Enables cleanup of old events
- ✅ Resilient to network issues and Stripe retries

**Performance Considerations**:

- Unique index check is O(1) for duplicate detection
- Table grows linearly with webhook volume
- Periodic cleanup recommended (e.g., keep 90 days)

**Testing**: `packages/db/webhook-idempotency.test.ts`

### Anti-Patterns to Avoid

❌ **Never**:

- Call external services without timeouts
- Retry indefinitely without limits
- Let external failures cascade to users
- Expose internal error details to clients
- Skip idempotency for payment operations
- Use infinite loops for retries
- Bypass rate limits without proper authorization

### Rate Limiting

**Location**: `packages/api/src/rate-limiter.ts`, `packages/api/src/trpc.ts`

**Purpose**: Protect API endpoints from abuse, DDoS attacks, and resource exhaustion

**Algorithm**: Token Bucket

**Rate Limits**:

- **Read Operations** (queries): 100 requests/minute
  - Endpoints: `getClusters`, `userPlans`, `queryCustomer`, `mySubscription`, `hello`
- **Write Operations** (mutations): 20 requests/minute
  - Endpoints: `createCluster`, `updateCluster`, `deleteCluster`, `updateUserName`, `insertCustomer`
- **Stripe Operations**: 10 requests/minute
  - Endpoints: `createSession`

**Implementation**:

1. **Rate Limiter Class**

   ```typescript
   const limiter = new RateLimiter({
     maxRequests: 100,
     windowMs: 60 * 1000, // 1 minute
   });

   const result = limiter.check(identifier);
   // Returns: { success: boolean, remaining: number, resetAt: number }
   ```

2. **tRPC Middleware Integration**

   ```typescript
   const rateLimitedProcedure = procedure.use(rateLimit("read"));
   const rateLimitedProtectedProcedure = protectedProcedure.use(rateLimit("write"));
   ```

3. **Error Response**
   ```typescript
   throw createApiError(ErrorCode.TOO_MANY_REQUESTS, "Rate limit exceeded. Please try again later.", { resetAt: result.resetAt });
   ```

**Features**:

1. **Token Bucket Algorithm**
   - Each request consumes a token
   - Tokens refill at end of window
   - Automatic cleanup of expired entries

2. **Identifier Strategy**
   - Authenticated: `user:{userId}`
   - Unauthenticated: `ip:{ipAddress}`

3. **Automatic Cleanup**
   - Removes entries older than 2x window duration
   - Runs every window duration
   - Prevents memory leaks

4. **Redis-Ready**
   - In-memory implementation for development
   - Can be swapped for Redis for distributed systems
   - Interface remains the same

**Usage Example**:

```typescript
import { createRateLimitedProtectedProcedure, EndpointType } from "@saasfly/api";

export const k8sRouter = createTRPCRouter({
  getClusters: createRateLimitedProtectedProcedure("read").query(async (opts) => {
    // Your query logic
  }),

  createCluster: createRateLimitedProtectedProcedure("write")
    .input(createSchema)
    .mutation(async ({ input }) => {
      // Your mutation logic
    }),
});
```

**Best Practices**:

1. **Handle Rate Limit Errors Client-Side**

   ```typescript
   try {
     await client.k8s.createCluster.mutate(input);
   } catch (error) {
     if (error.data?.code === "TOO_MANY_REQUESTS") {
       const resetAt = error.data?.details?.resetAt;
       const waitTime = resetAt - Date.now();
       await new Promise((resolve) => setTimeout(resolve, waitTime));
       // Retry after wait
     }
   }
   ```

2. **Monitor Rate Limit Usage**

   ```typescript
   const limiter = getLimiter("read");
   const result = limiter.check(identifier);
   console.log(`Remaining: ${result.remaining}, Reset: ${new Date(result.resetAt)}`);
   ```

3. **Choose Appropriate Limits**
   - Read operations: Higher limits (less impact)
   - Write operations: Lower limits (more impact)
   - Expensive operations: Lowest limits (Stripe, external APIs)

**Error Response Format**:

```typescript
interface ApiErrorResponse {
  error: {
    code: "TOO_MANY_REQUESTS";
    message: "Rate limit exceeded. Please try again later.";
    details?: {
      resetAt: number; // Unix timestamp
    };
  };
}
```

**Response Headers** (future enhancement):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704729600
```

**Production Considerations**:

1. **Distributed Rate Limiting**
   - Use Redis for multi-instance deployments
   - Shared state across multiple API servers
   - Consistent rate limiting regardless of which server handles the request

2. **Monitoring and Alerts**
   - Track rate limit violations
   - Alert on unusual patterns (DDoS detection)
   - Monitor token usage per user/IP

3. **Dynamic Rate Limits**
   - Adjust limits based on user subscription tier
   - Higher limits for premium customers
   - Lower limits for free tier users

**Documentation**:

- Complete API specification in `docs/api-spec.md`
- Includes rate limits for all endpoints
- Best practices for handling rate limit errors
- Example implementations

---

### High Priority

1. ~~Add foreign key constraints to User table~~ ✅ Completed
2. ~~Implement proper migration strategy~~ ✅ Completed
3. ~~Add cascade delete policies~~ ✅ Completed
4. ~~Implement integration hardening~~ ✅ Completed
5. ~~Improve type safety - Remove "as any" type assertions~~ ✅ Completed
6. ~~Create API documentation~~ ✅ Completed

### Medium Priority

1. ~~Implement proper soft delete pattern with partial unique indexes~~ ✅ Completed
2. ~~Clarify unique constraint strategy for clusters~~ ✅ Completed
3. ~~Standardize error responses~~ ✅ Completed
4. ~~Add rate limiting for API endpoints~~ ✅ Completed
5. Add data validation at application boundary
6. Implement request ID tracking for distributed tracing

### Low Priority

1. ~~Audit query patterns for N+1 issues~~ ✅ Completed (2026-01-10)
2. ~~Consider adding composite indexes for multi-column queries~~ ✅ Completed (2026-01-10)
3. ~~Add check constraints for data validation~~ ✅ Completed (2026-01-31)
4. ~~Add database triggers for automated maintenance~~ ✅ Completed (2026-01-31)
5. ~~Add row-level security for multi-tenant data~~ ✅ Completed (2026-01-31)
6. Implement read replicas if read-heavy workload
7. Add integration tests for external services
8. Set up monitoring for circuit breaker states

## UI/UX Patterns

### Status Badge Component Pattern

**Location**: `packages/ui/src/status-badge.tsx`

**Purpose**: Reusable component for displaying status indicators with visual feedback and accessibility support.

**Pattern**:

```typescript
export type ClusterStatus = "PENDING" | "CREATING" | "INITING" | "RUNNING" | "STOPPED" | "DELETED";

const statusConfig = {
  PENDING: { icon: Clock, label: "Pending", bgColor: "...", textColor: "..." },
  CREATING: { icon: Loader2, label: "Creating", animate: true },
  // ...
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div role="status" aria-label={`${config.label} status`}>
      <span className={styles.dot} />
      <Icon className={config.animate ? "animate-spin" : ""} aria-hidden="true" />
      <span className="sr-only">{config.label}</span>
    </div>
  );
}
```

**Key Features**:

- Configuration-based styling (centralized status definitions)
- Animated spinners for in-progress states
- Color-coded backgrounds for visual hierarchy
- ARIA labels for screen readers
- Size variants (sm, default, lg)
- `sr-only` class for screen-reader-only text

**Accessibility**:

- `role="status"` - Announces as status region
- `aria-label` - Describes status to screen readers
- `aria-hidden="true"` - Hides decorative icons
- `sr-only` class - Text only for screen readers

**Usage Example**:

```typescript
<StatusBadge status="RUNNING" size="sm" />
<StatusBadge status="CREATING" size="default" />
```

### Responsive Table to Card Pattern

**Location**: `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx`

**Purpose**: Transform table layouts to card-based layouts on mobile devices for better touch interaction.

**Pattern**:

```typescript
<div className="space-y-4">
  <div className="hidden md:block divide-y divide-border rounded-md border">
    <Table>
      {/* Table header and rows */}
    </Table>
  </div>

  <div className="grid grid-cols-1 gap-4 md:hidden">
    {clusters.map((cluster) => (
      <article className="flex flex-col gap-3 rounded-md border p-4">
        {/* Card content */}
      </article>
    ))}
  </div>
</div>
```

**Key Features**:

- Table view on desktop (md breakpoint: 768px+)
- Card view on mobile with touch-friendly layout
- Semantic HTML (`<article>` elements)
- Same data displayed in both views
- Proper spacing for touch targets

**Responsive Classes**:

- `hidden md:block` - Table hidden on mobile, shown on desktop
- `md:hidden` - Cards shown on mobile, hidden on desktop
- `grid-cols-1 gap-4` - Single column cards with spacing
- `flex flex-col gap-3` - Vertical card layout

**Mobile Card Structure**:

```typescript
<article className="flex flex-col gap-3 rounded-md border p-4">
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <h3 className="font-semibold"><Link>{cluster.name}</Link></h3>
      <p className="text-sm text-muted-foreground">{cluster.location}</p>
    </div>
    <ClusterOperations cluster={cluster} />
  </div>
  <div className="flex flex-wrap gap-4 border-t pt-3">
    <div><span>Plan:</span> {cluster.plan}</div>
    <div><span>Status:</span> <StatusBadge status={cluster.status} /></div>
    <div><span>Updated:</span> {formatDate(cluster.updatedAt)}</div>
  </div>
</article>
```

### Loading Skeleton Pattern

**Location**: `apps/nextjs/src/components/dashboard-skeleton.tsx`

**Purpose**: Provide visual feedback during data loading to improve perceived performance.

**Pattern**:

```typescript
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <table className="w-full">
        <thead>
          <tr>{/* Skeleton header */}</tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>{/* Skeleton cells */}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Key Features**:

- Matches actual content structure
- Multiple skeleton rows for realistic feel
- Header and action button skeletons
- Animate-pulse for smooth animation

**Usage**:

```typescript
export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="kubernetes" />
      <DashboardSkeleton />
    </DashboardShell>
  );
}
```

## Performance Best Practices

### Import Patterns for Tree-Shaking

**Rule: Never use namespace imports for large libraries**

❌ **Anti-Pattern**:

```typescript
import * as Icons from "@saasfly/ui/icons";
// This imports ALL icons, even if only 1-2 are used
<Icons.Check />
<Icons.Spinner />
```

✅ **Correct Pattern**:

```typescript
import { Check, Spinner } from "@saasfly/ui/icons";
// Only imports the specific icons needed for tree-shaking
<Check />
<Spinner />
```

**Impact**:

- Lucide-react has 1000+ icons
- Namespace imports defeat tree-shaking
- Direct imports allow bundlers to eliminate unused code
- Estimated bundle savings: 100-200KB per unused icon set

**Exceptions**:

- Dynamic icon access (e.g., `Icons[name]`) requires namespace import
- Document these exceptions with inline comments
- Use `keyof typeof Icons` for type safety

### Bundle Optimization Checklist

- [x] Use direct imports instead of namespace imports for large libraries
- [ ] Run bundle analyzer to identify large chunks
- [ ] Enable code splitting for heavy routes
- [ ] Lazy load components not immediately visible
- [ ] Use `next/dynamic` for below-the-fold content

## Security

### Security Headers

The application implements comprehensive security headers across all requests:

**Response Headers (next.config.mjs)**:

- `X-DNS-Prefetch-Control: on` - Controls DNS prefetching
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` - Enforces HTTPS for 2 years
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: origin-when-cross-origin` - Controls referrer information leakage
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Limits access to sensitive device features

**Content Security Policy (middleware.ts)**:
The CSP header is dynamically added via middleware to protect against XSS attacks:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' cdn.jsdelivr.net;
  img-src 'self' blob: data: https://*.unsplash.com https://*.githubusercontent.com ...;
  font-src 'self' data: cdn.jsdelivr.net;
  connect-src 'self' https://*.clerk.accounts.dev https://*.stripe.com ...;
  frame-src 'self' https://js.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`;
```

**Key CSP Directives**:

- `default-src 'self'` - Only load resources from same origin by default
- `object-src 'none'` - Prevents loading plugins (Flash, PDF, etc.)
- `script-src` - Allows only trusted sources for JavaScript
- `style-src` - Controls stylesheet loading
- `img-src` - Restricts image sources to approved domains
- `connect-src` - Limits API calls to approved endpoints
- `frame-src` - Allows only Stripe's iframe for payment flows
- `upgrade-insecure-requests` - Forces HTTPS
- `block-all-mixed-content` - Blocks mixed HTTP/HTTPS content

**Clerk Authentication Security**:

- CSRF protection built into Clerk middleware
- Session tokens managed securely via Clerk
- JWT-based authentication with proper validation
- Automatic session refresh and management

**Additional Security Measures**:

- Environment variable validation with Zod (@t3-oss/env-nextjs)
- Stripe webhook signature verification
- Input validation with Zod schemas at API boundaries
- Rate limiting on all API endpoints
- Request ID tracking for distributed tracing and audit logs

**Security in Development**:

- ESLint and TypeScript checking enabled for production builds
- No error suppression in build process
- Strict type checking enforced

### Webhook Security

**Stripe Webhooks**:

- Signature verification using STRIPE_WEBHOOK_SECRET
- Prevents replay attacks and fake webhooks
- Error handling ensures proper logging of suspicious events

## Future Considerations

### Scaling

- Consider read replicas for dashboard queries
- Partitioning for large tables (K8sClusterConfig)

### Performance

- Add connection pooling configuration
- Implement query result caching
- Consider materialized views for aggregations

### Security

- ✅ Row-level security for multi-tenant data
- Audit logging for sensitive operations
- Data encryption at rest
- Implement security response headers ✅ Completed
