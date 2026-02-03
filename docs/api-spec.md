# Basefly API Specification

## Overview

The Basefly API is built on tRPC (TypeScript Remote Procedure Call) and provides endpoints for managing Kubernetes clusters, customer subscriptions, and Stripe billing integration. All endpoints use a standardized error response format and implement resilience patterns including circuit breakers, retries, and timeouts.

## Base URL

```
http://localhost:3000/api/trpc
```

## Authentication

All API endpoints require authentication using Clerk. Authentication is handled via the `protectedProcedure` middleware, which validates the user's session and provides `ctx.userId` for all protected routes.

### Authentication Flow

1. User authenticates via Clerk (OAuth or email/password)
2. Clerk provides JWT token
3. Token is validated by middleware
4. `ctx.userId` is available in all protected procedures

### Authentication Requirements

- **Required for**: All endpoints except health checks
- **Provider**: Clerk
- **Token Location**: Authorization header (handled automatically by Clerk SDK)
- **User Context**: Available as `ctx.userId` in all protected procedures

## Error Response Format

All errors follow a standardized format:

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

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | User lacks permission for the resource |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INTEGRATION_ERROR` | 500 | External service error (Stripe, etc.) |
| `TIMEOUT_ERROR` | 500 | Request to external service timed out |
| `CIRCUIT_BREAKER_OPEN` | 503 | Service temporarily unavailable (circuit breaker open) |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service unavailable |

## Rate Limiting

Rate limiting is enforced for all API endpoints to protect against abuse and ensure fair resource allocation.

### Rate Limit Algorithm

**Algorithm**: Token Bucket

**Storage**: In-memory (production should use Redis for distributed systems)

### Rate Limits

| Endpoint Type | Limit | Window | Example Endpoints |
|---------------|-------|--------|------------------|
| Read Operations | 100 requests/minute | 60 seconds | `getClusters`, `userPlans`, `queryCustomer`, `mySubscription`, `hello` |
| Write Operations | 20 requests/minute | 60 seconds | `createCluster`, `updateCluster`, `deleteCluster`, `updateUserName`, `insertCustomer` |
| Stripe Operations | 10 requests/minute | 60 seconds | `createSession` |

### Rate Limit Response Headers

When rate limiting is enforced, the following headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704729600
```

### Rate Limit Error Response

```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "resetAt": 1704729600
    }
  }
}
```

### Rate Limit Reset Behavior

- Rate limit windows reset automatically after the configured window (60 seconds)
- Tokens are refilled at the end of the window period
- Failed requests do not reset the window
- Rate limits are applied per user (authenticated) or per IP address (unauthenticated)

### Best Practices for Rate Limiting

1. **Implement Exponential Backoff**: When receiving a rate limit error, wait longer between retries
2. **Cache Responses**: Cache read-only responses to reduce API calls
3. **Batch Operations**: When possible, combine multiple operations into a single request
4. **Monitor Usage**: Track your API usage to avoid hitting limits unexpectedly

**Example: Handling Rate Limits**

```typescript
import { wait } from '@saasfly/utils';

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.data?.code === "TOO_MANY_REQUESTS" && i < maxRetries - 1) {
        const resetAt = error.data?.details?.resetAt;
        const waitTime = resetAt ? resetAt - Date.now() : 1000 * Math.pow(2, i);
        await wait(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

# API Endpoints

## 1. Kubernetes Cluster Management (k8s)

### 1.1 Get User Clusters

Retrieve all active Kubernetes clusters for the authenticated user.

**Endpoint**: `k8s.getClusters`

**Method**: `query`

**Authentication**: Required

**Request**: None (uses `ctx.userId` from authentication)

**Response**:

```typescript
interface Cluster {
  id: number;
  name: string;
  location: string;
  network?: string;
  plan: "FREE" | "PRO" | "BUSINESS";
  status: "PENDING" | "CREATING" | "INITING" | "RUNNING" | "STOPPED" | "DELETED";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
```

**Success Example**:

```typescript
const clusters = await client.k8s.getClusters.query();
// Returns: Array of Cluster objects
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Database query failed

---

### 1.2 Create Cluster

Create a new Kubernetes cluster for the authenticated user.

**Endpoint**: `k8s.createCluster`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface CreateClusterInput {
  name: string;
  location: string;
}
```

**Response**:

```typescript
interface CreateClusterResponse {
  id: number;
  clusterName: string;
  location: string;
  success: true;
}
```

**Success Example**:

```typescript
const result = await client.k8s.createCluster.mutate({
  name: "my-cluster",
  location: "us-east-1"
});
// Returns: { id: 1, clusterName: "my-cluster", location: "us-east-1", success: true }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Failed to create cluster
- `CONFLICT`: User already has a cluster in the same plan

**Constraints**:
- One cluster per subscription plan (FREE, PRO, BUSINESS) per user
- Soft delete removes the cluster but preserves audit trail
- `deletedAt IS NULL` enforces uniqueness constraint

---

### 1.3 Update Cluster

Update an existing Kubernetes cluster.

**Endpoint**: `k8s.updateCluster`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface UpdateClusterInput {
  id: number;
  name?: string;
  location?: string;
}
```

**Response**:

```typescript
interface UpdateClusterResponse {
  success: true;
}
```

**Success Example**:

```typescript
const result = await client.k8s.updateCluster.mutate({
  id: 1,
  name: "updated-cluster-name"
});
// Returns: { success: true }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Cluster not found or has been deleted
- `FORBIDDEN`: User doesn't have access to this cluster
- `INTERNAL_SERVER_ERROR`: Failed to update cluster

**Authorization Rules**:
- Only cluster owner can update
- Cluster must exist and be active (not soft-deleted)

---

### 1.4 Delete Cluster

Soft delete a Kubernetes cluster (preserves audit trail).

**Endpoint**: `k8s.deleteCluster`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface DeleteClusterInput {
  id: number;
}
```

**Response**:

```typescript
interface DeleteClusterResponse {
  success: true;
}
```

**Success Example**:

```typescript
const result = await client.k8s.deleteCluster.mutate({ id: 1 });
// Returns: { success: true }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `NOT_FOUND`: Cluster not found or already deleted
- `FORBIDDEN`: User doesn't have access to this cluster
- `INTERNAL_SERVER_ERROR`: Failed to delete cluster

**Notes**:
- Uses soft delete pattern (`deletedAt` timestamp)
- Cluster can be restored if needed
- Ownership validated before deletion

---

## 2. Stripe Billing Integration (stripe)

### 2.1 Create Checkout/Billing Session

Create a Stripe checkout session for new subscriptions or billing session for existing customers.

**Endpoint**: `stripe.createSession`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface CreateSessionInput {
  planId: string; // Stripe price ID
}
```

**Response**:

```typescript
interface CreateSessionResponse {
  success: true | false;
  url?: string; // Stripe checkout/billing portal URL
}
```

**Success Example (New Subscription)**:

```typescript
const result = await client.stripe.createSession.mutate({
  planId: "price_1234567890"
});
// Returns: { success: true, url: "https://checkout.stripe.com/..." }
```

**Success Example (Existing Customer)**:

```typescript
const result = await client.stripe.createSession.mutate({
  planId: "price_1234567890"
});
// Returns: { success: true, url: "https://billing.stripe.com/..." }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTEGRATION_ERROR`: Stripe API error
- `TIMEOUT_ERROR`: Stripe API request timed out (30s)
- `CIRCUIT_BREAKER_OPEN`: Stripe service temporarily unavailable

**Integration Patterns**:
- **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Timeout**: 30 seconds
- **Circuit Breaker**: Opens after 5 consecutive failures, resets after 60s
- **Idempotency**: Uses idempotency key `checkout_{userId}_{planId}` to prevent duplicate charges

---

### 2.2 Get User Subscription Plan

Retrieve the user's current subscription plan and billing details.

**Endpoint**: `stripe.userPlans`

**Method**: `query`

**Authentication**: Required

**Request**: None (uses `ctx.userId`)

**Response**:

```typescript
interface UserSubscriptionPlan {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: number; // Unix timestamp
  isPaid: boolean;
  interval: "month" | "year" | null;
  isCanceled?: boolean;
}
```

**Success Example**:

```typescript
const plan = await client.stripe.userPlans.query();
// Returns: UserSubscriptionPlan object with billing details
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Failed to fetch subscription data
- `INTEGRATION_ERROR`: Stripe API error when retrieving subscription details
- `TIMEOUT_ERROR`: Stripe API request timed out
- `CIRCUIT_BREAKER_OPEN`: Stripe service temporarily unavailable

**Notes**:
- Returns FREE plan if user has no paid subscription
- `isPaid` checks if subscription is active and not expired
- Calls Stripe API to get `cancel_at_period_end` status if subscription exists

---

## 3. Customer Management (customer)

### 3.1 Update User Name

Update the authenticated user's display name.

**Endpoint**: `customer.updateUserName`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface UpdateUserNameInput {
  userId: string;
  name: string;
}
```

**Response**:

```typescript
interface UpdateUserNameResponse {
  success: boolean;
  reason: string;
}
```

**Success Example**:

```typescript
const result = await client.customer.updateUserName.mutate({
  userId: "user_123",
  name: "John Doe"
});
// Returns: { success: true, reason: "" }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated or userId doesn't match
- `INTERNAL_SERVER_ERROR`: Failed to update user name

**Authorization Rules**:
- Users can only update their own name
- `userId` must match `ctx.userId`

---

### 3.2 Insert Customer

Create a customer record for the authenticated user.

**Endpoint**: `customer.insertCustomer`

**Method**: `mutation`

**Authentication**: Required

**Request**:

```typescript
interface InsertCustomerInput {
  userId: string;
}
```

**Response**: None (void)

**Success Example**:

```typescript
await client.customer.insertCustomer.mutate({ userId: "user_123" });
// Returns: undefined (success)
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Failed to create customer record

**Notes**:
- Creates customer with FREE plan by default
- Used during user onboarding

---

### 3.3 Query Customer

Retrieve customer record for the authenticated user.

**Endpoint**: `customer.queryCustomer`

**Method**: `query`

**Authentication**: Required

**Request**:

```typescript
interface QueryCustomerInput {
  userId: string;
}
```

**Response**:

```typescript
interface Customer {
  id: number;
  authUserId: string;
  name?: string;
  plan?: "FREE" | "PRO" | "BUSINESS";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Success Example**:

```typescript
const customer = await client.customer.queryCustomer.query({ userId: "user_123" });
// Returns: Customer object or undefined if not found
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Failed to query customer

**Notes**:
- Returns `undefined` if customer not found
- Uses `noStore()` to disable caching

---

## 4. Authentication (auth)

### 4.1 Get User Subscription

Retrieve the authenticated user's subscription status.

**Endpoint**: `auth.mySubscription`

**Method**: `query`

**Authentication**: Required

**Request**: None (uses `ctx.userId`)

**Response**:

```typescript
interface UserSubscription {
  plan?: "FREE" | "PRO" | "BUSINESS";
  endsAt?: Date;
}
```

**Success Example**:

```typescript
const subscription = await client.auth.mySubscription.query();
// Returns: { plan: "PRO", endsAt: new Date("2024-12-31") }
// or: { plan: "FREE" } for free tier
// or: null if customer record doesn't exist
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `INTERNAL_SERVER_ERROR`: Failed to fetch subscription

**Notes**:
- Returns `null` if customer record doesn't exist
- Uses `noStore()` to disable caching

---

## 5. Health Check (hello)

### 5.1 Hello Endpoint

Simple health check endpoint that echoes back input text.

**Endpoint**: `hello.hello`

**Method**: `query`

**Authentication**: Required

**Request**:

```typescript
interface HelloInput {
  text: string;
}
```

**Response**:

```typescript
interface HelloResponse {
  greeting: string;
}
```

**Success Example**:

```typescript
const result = await client.hello.hello.query({ text: "World" });
// Returns: { greeting: "hello World" }
```

**Error Responses**:

- `UNAUTHORIZED`: User not authenticated
- `VALIDATION_ERROR`: Invalid input

---

# Integration Patterns

## Resilience Features

All external service integrations (Stripe) implement resilience patterns:

### 1. Circuit Breaker

Prevents cascading failures when external services are unavailable.

**Configuration**:
- Opens after: 5 consecutive failures
- Reset timeout: 60 seconds
- Fails fast when open

**Error**: `CIRCUIT_BREAKER_OPEN` - Service temporarily unavailable

### 2. Retry with Exponential Backoff

Handles transient failures (network issues, rate limits).

**Configuration**:
- Max attempts: 3
- Base delay: 1 second
- Max delay: 10 seconds
- Backoff pattern: 1s, 2s, 4s

**Retryable Errors**:
- Network errors
- Timeout errors
- Rate limit errors (HTTP 429)
- 5xx server errors

### 3. Timeout Protection

Prevents hanging requests to external services.

**Configuration**:
- Default timeout: 30 seconds
- Throws: `TIMEOUT_ERROR`

### 4. Idempotency

Ensures safe retries without duplicate operations.

**Implementation**:
- Idempotency keys for Stripe operations
- Format: `checkout_{userId}_{planId}`
- Prevents duplicate charges

## Webhook Reliability

Stripe webhooks are processed with comprehensive error handling, logging, and idempotency protection:

**Event Types**:
- `checkout.session.completed` - Subscription created
- `invoice.payment_succeeded` - Payment successful

**Error Handling**:
- All errors caught and logged
- `IntegrationError` for retryable issues
- Invalid metadata prevents retry
- No silent failures

**Idempotency Protection**:
- **Database Tracking**: All webhook events stored in `StripeWebhookEvent` table
- **Duplicate Prevention**: Unique constraint prevents reprocessing same event
- **Automatic Skip**: Handler not executed if event already processed
- **Audit Trail**: Complete history of all processed webhook events

**Idempotency Implementation**:

The webhook handler uses idempotency to prevent duplicate processing:

```typescript
import { executeIdempotentWebhook } from "@saasfly/db/webhook-idempotency";

export async function handleEvent(event: Stripe.Event) {
  await executeIdempotentWebhook(
    event.id,        // Stripe event ID (evt_*)
    event.type,      // Event type (e.g., checkout.session.completed)
    async () => processEventInternal(event)
  );
}
```

**How Idempotency Works**:

1. Stripe sends webhook with `event.id` (unique globally)
2. Handler attempts to register event in database
3. If event already exists → skip processing (duplicate)
4. If event is new → process the webhook
5. Mark event as processed after successful completion
6. On error → throw to trigger Stripe retry (if retryable)

**Benefits**:
- ✅ Prevents duplicate database updates
- ✅ Prevents duplicate subscription records
- ✅ Prevents duplicate charges on checkout
- ✅ Resilient to network issues and Stripe retries
- ✅ Provides complete audit trail

**Database Schema**:

```sql
CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "eventType" TEXT NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "StripeWebhookEvent_id_key" ON "StripeWebhookEvent"("id");
CREATE INDEX "StripeWebhookEvent_processed_idx" ON "StripeWebhookEvent"("processed");
```

---

# Data Models

## Subscription Plans

```typescript
enum SubscriptionPlan {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS"
}
```

## Cluster Status

```typescript
enum ClusterStatus {
  PENDING = "PENDING",
  CREATING = "CREATING",
  INITING = "INITING",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  DELETED = "DELETED"
}
```

---

# Usage Examples

## Client Setup

```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@saasfly/api';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      // Authentication is handled automatically by Clerk
    }),
  ],
});
```

## Complete Workflow Example

```typescript
// 1. Check user's current clusters
const clusters = await client.k8s.getClusters.query();

// 2. Create a new cluster
const newCluster = await client.k8s.createCluster.mutate({
  name: "production-cluster",
  location: "us-west-2"
});

// 3. Create Stripe checkout session for upgrade
const session = await client.stripe.createSession.mutate({
  planId: "price_1234567890"
});

// 4. Redirect to Stripe
if (session.success && session.url) {
  window.location.href = session.url;
}

// 5. After payment, check subscription
const plan = await client.stripe.userPlans.query();
console.log(`Current plan: ${plan.title}, isPaid: ${plan.isPaid}`);

// 6. Update cluster if needed
await client.k8s.updateCluster.mutate({
  id: newCluster.id,
  name: "updated-production-cluster"
});
```

---

# Best Practices

## 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  const cluster = await client.k8s.createCluster.mutate(input);
} catch (error) {
  if (error.data?.code === "VALIDATION_ERROR") {
    // Handle validation errors
  } else if (error.data?.code === "CIRCUIT_BREAKER_OPEN") {
    // Retry later or show degraded UI
  } else if (error.data?.code === "FORBIDDEN") {
    // Show permission denied message
  } else {
    // Show generic error message
  }
}
```

## 2. Idempotency

Design client-side operations to be idempotent:

```typescript
// Generate unique idempotency key on client
const idempotencyKey = `checkout_${userId}_${planId}_${Date.now()}`;
const session = await client.stripe.createSession.mutate({
  planId,
  idempotencyKey
});
```

## 3. Loading States

Show appropriate loading states during async operations:

```typescript
const [loading, setLoading] = useState(false);

const handleCreateCluster = async () => {
  setLoading(true);
  try {
    await client.k8s.createCluster.mutate(input);
  } finally {
    setLoading(false);
  }
};
```

## 4. Optimistic Updates

Consider optimistic UI updates for better UX:

```typescript
// Optimistically update UI
setClusters(prev => [...prev, newCluster]);

// Then make API call
try {
  const result = await client.k8s.createCluster.mutate(input);
} catch (error) {
  // Rollback on error
  setClusters(prev => prev.filter(c => c.id !== newCluster.id));
}
```

---

# Version History

- **v1.0** (2024-01-08): Initial API specification
  - All routers documented
  - Error codes standardized
  - Integration patterns documented
  - Usage examples provided

---

# Support

For questions or issues related to the API:

1. Check this documentation first
2. Review `docs/blueprint.md` for integration patterns
3. Check `docs/task.md` for known issues and improvements
4. Open an issue on GitHub for bugs or feature requests
