# Phase 2 Feature Hardening Analysis — 2026-07-25

**Evaluator:** Sisyphus (Autonomous Engineering Agent)
**Evaluation Date:** 2026-07-25
**State:** PHASE 2 — HARDENING & INTEGRATION

---

## Finding 1: Stripe Package Coupled to Database Layer

### Observation

`packages/stripe/src/webhooks.ts` imports `db` and `SubscriptionPlan` directly from `@saasfly/db`:

```typescript
import { db, SubscriptionPlan } from "@saasfly/db";
```

This creates a tight coupling between a domain/external-integration package and the database infrastructure layer.

### Affected Files

- `packages/stripe/src/webhooks.ts` (lines 3, 79, 95-103, 113, 129-141)
- `packages/stripe/src/webhook-idempotency.ts` (line 1)
- `packages/stripe/src/webhook-idempotency.test.ts` (line 3)

### Impact / Risk

- Medium: Changes to database schema require changes in the Stripe package
- Medium: Testing Stripe webhooks requires mocking the database layer
- Low: Packages cannot be independently extracted or reused

### Suggested Fix

Introduce a repository abstraction or dependency injection pattern. The Stripe webhook handler should accept a `CustomerRepository` interface rather than importing `db` directly.

---

## Finding 2: Duplicate webhook event routing logic

### Observation

The `handleCheckoutSessionCompleted` and `handleInvoicePaymentSucceeded` functions in `packages/stripe/src/webhooks.ts` have nearly identical logic:

1. Both call `resolveSubscriptionCustomer(session)`
2. Both open a `db.transaction()`
3. Both query `Customer` by `authUserId`
4. Both update the customer record with Stripe data

The only differences are:

- `handleCheckoutSessionCompleted` checks for `priceId` existence differently
- `handleInvoicePaymentSucceeded` also updates `plan` and `stripeCurrentPeriodEnd`

### Affected Files

- `packages/stripe/src/webhooks.ts` (lines 72-144)

### Impact / Risk

- Low-Medium: ~70% code duplication makes future changes riskier
- Low: Adds maintenance burden for what should be a shared update path

### Suggested Fix

Extract common customer update logic into a shared helper function, parameterized by the fields to update.

---

## Finding 3: Missing Input Validation in Webhook Event Processing

### Observation

The `processEventInternal` function in `packages/stripe/src/webhooks.ts` does not validate:

- That `event.data.object` exists before casting to `Stripe.Checkout.Session`
- That `event.type` is a known webhook event type before processing
- That session data contains required fields before calling Stripe API

### Affected Files

- `packages/stripe/src/webhooks.ts` (lines 20-52)

### Impact / Risk

- Medium: Invalid webhook events could cause unhandled errors
- Medium: Stripe API calls made with potentially incomplete data

### Suggested Fix

Add validation guard clauses at the top of `processEventInternal` for event data integrity before processing.

---

## Finding 4: Customer.findOneByAuthUserId Pattern Duplication

### Observation

The pattern of querying a Customer by `authUserId` is repeated in multiple places:

- `packages/api/src/router/customer.ts` — `db.selectFrom("Customer")...where("authUserId", "=", userId)`
- `packages/api/src/router/k8s.ts` — same pattern
- `packages/stripe/src/webhooks.ts` — same pattern in two handlers

There is no shared `customerService.findByAuthUserId()` function that consolidates this query.

### Affected Files

- `packages/api/src/router/customer.ts`
- `packages/api/src/router/k8s.ts`
- `packages/stripe/src/webhooks.ts`
- `packages/db/src/` (missing service function)

### Impact / Risk

- Low: Duplication of simple queries
- Low: Missed opportunity for centralized query optimization

### Suggested Fix

Add a `customerService.findByAuthUserId(authUserId)` method to `packages/db/src/` and use it consistently.

---

## Summary

| #   | Finding                            | Severity | Type        |
| --- | ---------------------------------- | -------- | ----------- |
| 1   | Stripe package coupled to DB layer | Medium   | Coupling    |
| 2   | Duplicate webhook update logic     | Low      | Duplication |
| 3   | Missing webhook input validation   | Medium   | Contract    |
| 4   | Customer query pattern duplication | Low      | Duplication |
