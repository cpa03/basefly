# Bugs

- [x] bug: Invalid HTML structure in Dashboard table. `ClusterItem` renders a `<tbody>` inside another `<tbody>`.
- [x] bug: Hardcoded language prefix `/en/` in `ClusterOperations` component.
- [x] bug: Missing language prefix in `Link` to cluster editor in `DashboardPage`.
- [x] bug: Inconsistent unauthorized access handling between `DashboardLayout` (returns 404) and `DashboardPage` (redirects to login).
- [x] bug: `K8sCreateButton` and `deleteCluster` in `ClusterOperations` lack try-catch blocks, leading to potential stuck loading states and unhandled promise rejections.
- [x] bug: Missing environment variables causing lint to fail: STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL - *Fixed by creating .env.local file*
- [x] bug: TypeScript type errors in packages/stripe/src/client.test.ts (11 errors related to undefined checks and idempotencyKey) - *Fixed - all tests pass*
- [x] bug: Test timeouts in packages/stripe/src/integration.test.ts (7 tests timing out after 5000ms) - *Fixed - all tests pass (394ms)*
- [x] bug: IntegrationError test throwing error instead of being caught - *Fixed - all tests pass*
- [x] bug: SyntaxError in multiple API router test files - require("@saasfly/db") returning unexpected token - *Fixed - all tests pass*
- [x] bug: Mock error in validation.test.ts - Cannot access 'MockIntegrationError' before initialization - *Fixed - all tests pass*
