# Feature Flags Documentation

This document provides comprehensive documentation for all feature flags in the Basefly platform.

## Overview

Feature flags allow runtime configuration of platform features without code changes. All flags are configured via environment variables in `.env.local` (or `.env.example` as a template).

**Configuration File**: `packages/common/src/config/features.ts`

**Default Behavior**: 
- Flags with `!== "false"` logic are **enabled by default** (opt-out)
- Flags with `=== "true"` logic are **disabled by default** (opt-in)

## Quick Reference

| Flag | Default | Category | Description |
|------|---------|----------|-------------|
| `ENABLE_BILLING` | Enabled | Billing | Master switch for billing features |
| `ENABLE_STRIPE_CHECKOUT` | Enabled | Billing | Stripe checkout for new subscriptions |
| `ENABLE_BILLING_PORTAL` | Enabled | Billing | Customer billing portal |
| `ENABLE_CLUSTERS` | Enabled | Clusters | Kubernetes cluster management |
| `ENABLE_AUTO_PROVISIONING` | Disabled | Clusters | Automatic cluster provisioning |
| `ENABLE_MULTI_REGION` | Disabled | Clusters | Multi-region cluster support |
| `ENABLE_MAGIC_LINKS` | Disabled | Auth | Passwordless magic link auth |
| `ENABLE_GOOGLE_OAUTH` | Disabled | Auth | Google OAuth provider |
| `ENABLE_GITHUB_OAUTH` | Disabled | Auth | GitHub OAuth provider |
| `ENABLE_EMAIL_NOTIFICATIONS` | Enabled | Notifications | Email notifications |
| `ENABLE_WEBHOOK_NOTIFICATIONS` | Disabled | Notifications | Webhook notifications |
| `ENABLE_VERCEL_ANALYTICS` | Enabled | Analytics | Vercel Analytics integration |
| `ENABLE_ADMIN_DASHBOARD` | Enabled | Admin | Admin dashboard access |
| `ENABLE_USER_MANAGEMENT` | Disabled | Admin | User management interface |
| `ENABLE_MOCK_PAYMENTS` | Disabled | Dev | Mock payments for testing |
| `VERBOSE_LOGGING` | Disabled | Dev | Detailed logging output |
| `IS_DEBUG` | Disabled | Dev | Debug mode |

---

## Billing Features

### `ENABLE_BILLING`

**Default**: `true` (enabled)

**Purpose**: Master switch for all billing-related functionality. When disabled, billing UI and API endpoints are hidden.

**Dependencies**:
- Requires `STRIPE_API_KEY`
- Requires `STRIPE_WEBHOOK_SECRET`
- Requires `NEXT_PUBLIC_STRIPE_*_PRODUCT_ID` and `NEXT_PUBLIC_STRIPE_*_PRICE_ID` variables

**Usage**:
```bash
# Enable billing (default)
ENABLE_BILLING="true"

# Disable billing completely
ENABLE_BILLING="false"
```

**Programmatic Access**:
```typescript
import { FEATURE_FLAGS } from "@saasfly/common/config/features";

if (FEATURE_FLAGS.billing.enabled) {
  // Show billing UI
}
```

---

### `ENABLE_STRIPE_CHECKOUT`

**Default**: `true` (enabled)

**Purpose**: Enable Stripe checkout sessions for new subscriptions. Allows users to upgrade their plan.

**Dependencies**:
- Requires `ENABLE_BILLING="true"`
- Requires Stripe product/price IDs configured

**Usage**:
```bash
ENABLE_STRIPE_CHECKOUT="true"  # Show upgrade buttons
ENABLE_STRIPE_CHECKOUT="false" # Hide upgrade buttons
```

**Programmatic Access**:
```typescript
if (FEATURE_FLAGS.billing.stripeCheckout) {
  // Show "Upgrade" button
}
```

---

### `ENABLE_BILLING_PORTAL`

**Default**: `true` (enabled)

**Purpose**: Enable Stripe billing portal for existing customers to manage their subscription.

**Dependencies**:
- Requires `ENABLE_BILLING="true"`
- Requires customer to have an active Stripe subscription

**Usage**:
```bash
ENABLE_BILLING_PORTAL="true"  # Show "Manage Subscription" button
ENABLE_BILLING_PORTAL="false" # Hide portal access
```

---

## Cluster Features

### `ENABLE_CLUSTERS`

**Default**: `true` (enabled)

**Purpose**: Master switch for Kubernetes cluster management features.

**Dependencies**:
- Requires `POSTGRES_URL` for cluster data storage
- Requires user authentication (Clerk)

**Usage**:
```bash
ENABLE_CLUSTERS="true"   # Show cluster management UI
ENABLE_CLUSTERS="false"  # Hide cluster features
```

**Programmatic Access**:
```typescript
if (FEATURE_FLAGS.clusters.enabled) {
  // Show cluster dashboard
}
```

---

### `ENABLE_AUTO_PROVISIONING`

**Default**: `false` (disabled)

**Purpose**: Enable automatic cluster provisioning after subscription payment. When enabled, clusters are automatically created when a user subscribes.

**Dependencies**:
- Requires `ENABLE_CLUSTERS="true"`
- Requires `ENABLE_BILLING="true"`
- Requires Kubernetes API integration (not yet implemented)

**Usage**:
```bash
ENABLE_AUTO_PROVISIONING="true"   # Auto-create clusters on subscription
ENABLE_AUTO_PROVISIONING="false"  # Manual cluster creation only
```

**Notes**:
- Currently in development
- Requires backend Kubernetes API integration

---

### `ENABLE_MULTI_REGION`

**Default**: `false` (disabled)

**Purpose**: Enable multi-region cluster support. Allows users to deploy clusters in different geographic regions.

**Dependencies**:
- Requires `ENABLE_CLUSTERS="true"`
- Requires region configuration in database

**Usage**:
```bash
ENABLE_MULTI_REGION="true"   # Show region selector
ENABLE_MULTI_REGION="false"  # Single region only
```

**Notes**:
- Currently in development
- Requires multi-region infrastructure setup

---

## Authentication Features

### `ENABLE_MAGIC_LINKS`

**Default**: `false` (disabled)

**Purpose**: Enable passwordless authentication via magic links sent to email.

**Dependencies**:
- Requires `RESEND_API_KEY` for sending emails
- Requires `RESEND_FROM` for sender email

**Usage**:
```bash
ENABLE_MAGIC_LINKS="true"   # Show "Sign in with Magic Link" option
ENABLE_MAGIC_LINKS="false"  # Hide magic link option
```

**Notes**:
- Requires Clerk configuration for magic link authentication
- See: https://clerk.com/docs/authentication/passwordless

---

### `ENABLE_GOOGLE_OAUTH`

**Default**: `false` (disabled)

**Purpose**: Enable Google OAuth authentication provider.

**Dependencies**:
- Requires Google OAuth app credentials configured in Clerk
- Requires Clerk dashboard setup

**Usage**:
```bash
ENABLE_GOOGLE_OAUTH="true"   # Show "Sign in with Google" button
ENABLE_GOOGLE_OAUTH="false"  # Hide Google OAuth option
```

**Setup**:
1. Configure Google OAuth in Clerk Dashboard
2. Set `ENABLE_GOOGLE_OAUTH="true"`
3. Verify redirect URLs match

---

### `ENABLE_GITHUB_OAUTH`

**Default**: `false` (disabled)

**Purpose**: Enable GitHub OAuth authentication provider.

**Dependencies**:
- Requires GitHub OAuth app credentials configured in Clerk
- Requires Clerk dashboard setup

**Usage**:
```bash
ENABLE_GITHUB_OAUTH="true"   # Show "Sign in with GitHub" button
ENABLE_GITHUB_OAUTH="false"  # Hide GitHub OAuth option
```

**Setup**:
1. Configure GitHub OAuth in Clerk Dashboard
2. Set `ENABLE_GITHUB_OAUTH="true"`
3. Verify redirect URLs match

---

## Notification Features

### `ENABLE_EMAIL_NOTIFICATIONS`

**Default**: `true` (enabled)

**Purpose**: Enable email notifications for platform events (cluster status, billing, etc.).

**Dependencies**:
- Requires `RESEND_API_KEY`
- Requires `RESEND_FROM`

**Usage**:
```bash
ENABLE_EMAIL_NOTIFICATIONS="true"   # Send email notifications
ENABLE_EMAIL_NOTIFICATIONS="false"  # Disable all emails
```

**Events Triggering Emails**:
- Cluster creation complete
- Cluster status changes
- Subscription renewal
- Payment failures

---

### `ENABLE_WEBHOOK_NOTIFICATIONS`

**Default**: `false` (disabled)

**Purpose**: Enable webhook notifications for external integrations.

**Dependencies**:
- Requires webhook endpoint configuration
- Requires external service to receive webhooks

**Usage**:
```bash
ENABLE_WEBHOOK_NOTIFICATIONS="true"   # Send webhook notifications
ENABLE_WEBHOOK_NOTIFICATIONS="false"  # Disable webhooks
```

**Notes**:
- Currently in development
- Requires webhook URL configuration

---

## Analytics Features

### `ENABLE_VERCEL_ANALYTICS`

**Default**: `true` (enabled)

**Purpose**: Enable Vercel Analytics for performance and usage tracking.

**Dependencies**:
- Requires deployment on Vercel
- Requires Vercel project configuration

**Usage**:
```bash
ENABLE_VERCEL_ANALYTICS="true"   # Enable analytics
ENABLE_VERCEL_ANALYTICS="false"  # Disable analytics
```

---

### PostHog Analytics

**Controlled by**: `NEXT_PUBLIC_POSTHOG_KEY`

**Purpose**: Enable PostHog product analytics.

**Dependencies**:
- Requires `NEXT_PUBLIC_POSTHOG_KEY` (non-empty)
- Requires `NEXT_PUBLIC_POSTHOG_HOST`

**Usage**:
```bash
# Enable PostHog
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Disable PostHog
NEXT_PUBLIC_POSTHOG_KEY=" "  # Space disables it
```

**Programmatic Access**:
```typescript
if (FEATURE_FLAGS.analytics.posthog) {
  // PostHog is configured and enabled
}
```

---

## Admin Features

### `ENABLE_ADMIN_DASHBOARD`

**Default**: `true` (enabled)

**Purpose**: Enable admin dashboard access for authorized users.

**Dependencies**:
- Requires `ADMIN_EMAIL` to be configured
- User email must match one of the emails in `ADMIN_EMAIL`

**Usage**:
```bash
ENABLE_ADMIN_DASHBOARD="true"   # Enable admin dashboard
ENABLE_ADMIN_DASHBOARD="false"  # Disable admin dashboard

# Configure admin emails (comma-separated)
ADMIN_EMAIL="admin@example.com,root@example.com"
```

**Access Control**:
- Access URL: `/admin/dashboard`
- Authorization: Email must be in `ADMIN_EMAIL` list
- Security: No public demo available

---

### `ENABLE_USER_MANAGEMENT`

**Default**: `false` (disabled)

**Purpose**: Enable user management interface in admin dashboard.

**Dependencies**:
- Requires `ENABLE_ADMIN_DASHBOARD="true"`
- Requires admin authorization

**Usage**:
```bash
ENABLE_USER_MANAGEMENT="true"   # Show user management UI
ENABLE_USER_MANAGEMENT="false"  # Hide user management
```

**Notes**:
- Currently in development
- Allows admins to view/manage users

---

## Development Features

### `ENABLE_MOCK_PAYMENTS`

**Default**: `false` (disabled)

**Purpose**: Use mock payment processing instead of real Stripe transactions. Useful for development and testing.

**Dependencies**:
- Only use in development environment
- Never enable in production

**Usage**:
```bash
ENABLE_MOCK_PAYMENTS="true"   # Mock all payments
ENABLE_MOCK_PAYMENTS="false"  # Use real Stripe
```

**Warning**:
- **Never enable in production**
- Only for development/testing
- Bypasses real payment validation

---

### `VERBOSE_LOGGING`

**Default**: `false` (disabled)

**Purpose**: Enable detailed logging output for debugging.

**Dependencies**:
- None

**Usage**:
```bash
VERBOSE_LOGGING="true"   # Enable detailed logs
VERBOSE_LOGGING="false"  # Standard logging
```

**Logs Include**:
- Database queries
- API request/response details
- Authentication events
- Performance metrics

---

### `IS_DEBUG`

**Default**: `false` (disabled)

**Purpose**: Enable debug mode for development. Shows additional UI elements and debugging information.

**Dependencies**:
- None

**Usage**:
```bash
IS_DEBUG="true"   # Enable debug mode
IS_DEBUG="false"  # Production mode
```

---

## Programmatic Usage

### Checking Feature Flags

```typescript
import { FEATURE_FLAGS, isFeatureEnabled, getEnabledFeatures } from "@saasfly/common/config/features";

// Method 1: Direct access
if (FEATURE_FLAGS.billing.enabled) {
  console.log("Billing is enabled");
}

// Method 2: Path-based check
if (isFeatureEnabled("billing.stripeCheckout")) {
  console.log("Stripe checkout is available");
}

// Method 3: Get all enabled features
const enabledFeatures = getEnabledFeatures();
console.log("Enabled features:", enabledFeatures);
// Output: ["billing", "billing.stripeCheckout", "billing.billingPortal", ...]
```

### Type Safety

```typescript
import type { FeatureFlagPath } from "@saasfly/common/config/features";

// Type-safe feature path
const feature: FeatureFlagPath = "billing.stripeCheckout"; // Valid
// const invalid: FeatureFlagPath = "invalid.path"; // TypeScript error
```

### Conditional Rendering in React

```tsx
import { FEATURE_FLAGS } from "@saasfly/common/config/features";

function BillingSection() {
  if (!FEATURE_FLAGS.billing.enabled) {
    return null;
  }

  return (
    <div>
      <h2>Billing</h2>
      {FEATURE_FLAGS.billing.stripeCheckout && <UpgradeButton />}
      {FEATURE_FLAGS.billing.billingPortal && <ManageSubscriptionButton />}
    </div>
  );
}
```

---

## Feature Flag Groups

The feature flags are organized into logical groups:

### Billing Group
- `ENABLE_BILLING` - Master switch
- `ENABLE_STRIPE_CHECKOUT` - New subscriptions
- `ENABLE_BILLING_PORTAL` - Subscription management

### Clusters Group
- `ENABLE_CLUSTERS` - Master switch
- `ENABLE_AUTO_PROVISIONING` - Auto-create on subscription
- `ENABLE_MULTI_REGION` - Multi-region support

### Auth Group
- `ENABLE_MAGIC_LINKS` - Passwordless auth
- `ENABLE_GOOGLE_OAUTH` - Google provider
- `ENABLE_GITHUB_OAUTH` - GitHub provider

### Notifications Group
- `ENABLE_EMAIL_NOTIFICATIONS` - Email alerts
- `ENABLE_WEBHOOK_NOTIFICATIONS` - External webhooks

### Analytics Group
- `ENABLE_VERCEL_ANALYTICS` - Vercel analytics
- PostHog (via `NEXT_PUBLIC_POSTHOG_KEY`)

### Admin Group
- `ENABLE_ADMIN_DASHBOARD` - Dashboard access
- `ENABLE_USER_MANAGEMENT` - User management UI

### Dev Group
- `ENABLE_MOCK_PAYMENTS` - Test payments
- `VERBOSE_LOGGING` - Detailed logs
- `IS_DEBUG` - Debug mode

---

## Best Practices

### 1. Use Defaults Wisely
- **Opt-out flags** (`!== "false"`): For features that should be ON by default
- **Opt-in flags** (`=== "true"`): For experimental or optional features

### 2. Document Dependencies
Always document required environment variables when adding new flags.

### 3. Graceful Degradation
When a feature is disabled, the UI should gracefully hide or show alternative content.

### 4. Never Expose Secrets
Feature flags should not expose sensitive configuration. Use server-side checks for security.

### 5. Test Both States
Always test your application with flags both enabled and disabled.

---

## Troubleshooting

### Feature Not Working

1. Check the flag is set correctly in `.env.local`
2. Restart the development server
3. Verify dependencies are configured
4. Check the flag's default behavior

### Billing Not Working

```bash
# Verify all required variables
ENABLE_BILLING="true"
STRIPE_API_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID="prod_xxx"
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID="price_xxx"
```

### Admin Dashboard Access Denied

```bash
# Verify admin email is configured
ADMIN_EMAIL="your-email@example.com"

# Verify flag is enabled
ENABLE_ADMIN_DASHBOARD="true"
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-18 | Initial documentation created |
| 2026-01-31 | Feature flags system implemented |

---

*This documentation is maintained as part of the Basefly platform. For updates, see `packages/common/src/config/features.ts`.*
