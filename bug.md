# Bugs

- [x] bug: Invalid HTML structure in Dashboard table. `ClusterItem` renders a `<tbody>` inside another `<tbody>`.
- [x] bug: Hardcoded language prefix `/en/` in `ClusterOperations` component.
- [x] bug: Missing language prefix in `Link` to cluster editor in `DashboardPage`.
- [x] bug: Inconsistent unauthorized access handling between `DashboardLayout` (returns 404) and `DashboardPage` (redirects to login).
- [x] bug: `K8sCreateButton` and `deleteCluster` in `ClusterOperations` lack try-catch blocks, leading to potential stuck loading states and unhandled promise rejections.
