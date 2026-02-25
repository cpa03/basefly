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
