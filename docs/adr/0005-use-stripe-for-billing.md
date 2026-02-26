# ADR 0005: Use Stripe for Billing

## Status

Accepted

## Context

The project is a SaaS application requiring subscription billing:
- Multiple pricing tiers (Free, Pro, Business)
- Monthly and yearly billing cycles
- Credit card payments
- Subscription management (upgrade, downgrade, cancel)
- Webhook handling for payment events

Building billing from scratch involves PCI compliance and complex logic. We needed:
- Reliable payment processing
- Subscription management
- Webhook handling
- Customer portal

## Decision

We chose **Stripe** as the billing and payment solution.

### Why Stripe

1. **Industry Standard**: Most popular payment processor for SaaS
2. **Developer Experience**: Excellent SDK and documentation
3. **Subscription Features**: Built-in subscription management
4. **Security**: PCI compliance handled by Stripe
5. **Webhook System**: Reliable event handling for async flows

## Consequences

### Positive

- Fast implementation of payment flows
- Built-in customer portal
- Subscription lifecycle management
- Extensive test mode for development
- Great analytics and dashboard

### Negative

- Transaction fees (2.9% + $0.30 per transaction)
- External dependency for critical feature

## Alternatives Considered

### Paddle
- **Rejected**: Less popular, fewer integrations
- More expensive pricing

### Lemon Squeezy
- **Rejected**: Newer, less mature
- Fewer features than Stripe

### Custom billing
- **Rejected**: PCI compliance complexity
- Time-consuming to build

## Implementation

- Stripe Checkout for payment flows
- Webhooks handle subscription events
- Customer portal for self-service
- Multiple products and prices for tiers

## Related

- packages/stripe: Stripe integration
- ADR 0003: Use Clerk for Authentication (user sync)
