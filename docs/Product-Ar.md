### Issue #609: [P2][Code Quality] Consolidate duplicate Zod schemas in tRPC routers

**Status**: Completed (PR #784)

**Problem**:
- Duplicate Zod schemas defined in both `k8s.ts` AND `schemas.ts`
- Same duplication for customer schemas
- Routers used inline schemas instead of centralized ones

**Solution**:
1. Removed inline schema definitions from `packages/api/src/router/k8s.ts`
   - `k8sClusterCreateSchema`, `k8sClusterDeleteSchema`, `k8sClusterUpdateSchema`

2. Removed inline schema definitions from `packages/api/src/router/customer.ts`
   - `updateUserNameSchema`, `insertCustomerSchema`, `queryCustomerSchema`

3. Updated routers to import from centralized `./schemas`

4. Updated `validation.test.ts` to use enhanced schema names

**Verification**:
- TypeScript typecheck: ✅ Pass (for packages/api)
- Tests: 1188 tests passed

**Files Changed**:
- Modified: `packages/api/src/router/k8s.ts`
- Modified: `packages/api/src/router/customer.ts`
- Modified: `packages/api/src/router/validation.test.ts`

**Impact**: Consolidated schema definitions, improved maintainability

---

### Issue #707: [Docs] README.md claims Zustand is used but it's not in the codebase

**Status**: Completed (PR #715)

**Problem**:
- README.md listed Zustand under "Global State Management"
- Zustand was in `apps/nextjs/package.json` but NEVER used in the codebase
- Zero imports of Zustand found across entire codebase

**Solution**:
- Removed unused `zustand: 5.0.11` from `apps/nextjs/package.json`
- Removed entire "Global State Management" section from README.md

**Verification**:
- TypeScript typecheck: ✅ Pass
- Tests: 819 tests passed
- Verified Zustand has zero imports in the codebase

**Impact**: Removed unused dependency, fixed documentation inaccuracy

---

### Issue #506: [P3][Code Quality] Consolidate navigation component duplication

**Status**: Completed

**Problem**:
Navigation logic was split across multiple components with overlapping responsibilities:

- `navbar.tsx` - Top navigation with auth/user menu
- `main-nav.tsx` - Mobile menu toggle and responsive header
- `nav.tsx` - Dashboard-style sidebar navigation

**Solution**:

1. Created `useMobileMenu` hook (`apps/nextjs/src/hooks/use-mobile-menu.ts`)
   - Shared mobile menu state management
   - Built-in keyboard navigation (Escape to close)
   - Focus management for accessibility

2. Created `NavLogo` component (`apps/nextjs/src/components/nav-logo.tsx`)
   - Consistent logo rendering across nav components
   - Configurable text and styling

3. Refactored `main-nav.tsx` to use `useMobileMenu` hook
   - Reduced from 111 lines to 77 lines
   - Removed duplicated keyboard/focus logic

**Verification**:

- TypeScript typecheck: ✅ Pass
- ESLint: ✅ Pass
- No warnings

**Files Changed**:

- Added: `apps/nextjs/src/hooks/use-mobile-menu.ts`
- Added: `apps/nextjs/src/components/nav-logo.tsx`
- Modified: `apps/nextjs/src/components/main-nav.tsx`
- Modified: `apps/nextjs/src/components/mobile-nav.tsx`

## Completed PRs

- PR #[TBD]: refactor(nav): consolidate navigation components with shared hooks - Issue #506
