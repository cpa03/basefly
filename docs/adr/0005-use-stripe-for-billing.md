# ADR 0005: Use Stripe for Billing

## Status

Accepted

## Context

We need a payment processing solution for our SaaS subscription model. Requirements include:
- Subscription billing (monthly/yearly)
- Multiple pricing tiers
- Customer portal
- Webhook handling for payment events
- Invoice management
- Tax compliance

## Decision

We have chosen **Stripe** as the payment processor for this project.

## Consequences

### Positive

- **Complete Solution**: Full billing suite out of the box
- **Developer Experience**: Excellent SDK and documentation
- **Security**: PCI compliance handled by Stripe
- **Features**: Subscriptions, invoices, customer portal, tax
- **Webhooks**: Reliable webhook system for events
- **Test Mode**: Easy testing with test keys

### Negative

- **Vendor Lock-in**: Dependent on Stripe
- **Fees**: Transaction fees apply
- **Complexity**: Many features require learning
- **Rate Limits**: Must handle rate limits in high traffic

## Alternatives Considered

### Paddle

- All-in-one solution
- **Rejected**: Less developer-friendly, higher fees

### Lemon Squeezy

- Developer-focused
- **Rejected**: Less mature, smaller ecosystem

### Direct Payment Processing

- More control
- **Rejected**: High compliance burden, complex setup

## Related

- [packages/stripe](../../packages/stripe/README.md)
- [Blueprint - Stripe Integration](../blueprint.md)
