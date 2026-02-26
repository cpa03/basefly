### Issue #676: [Docs] Add ADR (Architecture Decision Records) documentation

**Status**: Completed

**Problem**:
The codebase lacked formal Architecture Decision Records. While `docs/blueprint.md` contained technical architecture information, it didn't capture the *why* behind key decisions, alternatives considered, and consequences of choices.

**Solution**:

1. Created `docs/adr/` directory with 6 ADRs:
   - ADR 0001: Use Prisma as ORM
   - ADR 0002: Adopt Kysely as Query Builder
   - ADR 0003: Use Clerk for Authentication
   - ADR 0004: Adopt tRPC for API
   - ADR 0005: Use Stripe for Billing
   - ADR 0006: Use Turbo Monorepo Structure

2. Each ADR follows standard format:
   - Title and Status
   - Context (issue motivating decision)
   - Decision (what was decided)
   - Consequences (positive and negative)
   - Alternatives Considered

3. Updated `docs/README.md` with ADR index table

**Verification**:

- File structure created correctly
- All 6 ADR files contain proper format
- README.md index table added

**Files Changed**:

- Added: `docs/adr/0001-use-prisma-as-orm.md`
- Added: `docs/adr/0002-adopt-kysely-query-builder.md`
- Added: `docs/adr/0003-use-clerk-for-authentication.md`
- Added: `docs/adr/0004-adopt-trpc-for-api.md`
- Added: `docs/adr/0005-use-stripe-for-billing.md`
- Added: `docs/adr/0006-use-turbo-monorepo-structure.md`
- Modified: `docs/README.md`

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
