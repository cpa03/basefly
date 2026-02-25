### Issue #666: [Architecture] Add global error boundary and error handling for Next.js app

**Status**: In Progress (PR #669)

**Problem**:
- Missing error.tsx at (auth) route group level
- Missing error.tsx at (dashboard) route group level
- Inconsistent error handling across route groups

**Solution**:

1. Created `(auth)/error.tsx` - Error boundary for auth routes
   - Follows existing error.tsx patterns (marketing, dashboard/*)
   - Uses useClientDictionary for i18n support
   - Consistent logging with logger

2. Created `(dashboard)/error.tsx` - Error boundary for dashboard routes
   - Same pattern as auth error boundary
   - Context-specific error messages

**Verification**:
- Code follows existing patterns in codebase
- Uses same imports and structure as marketing/error.tsx

**Files Changed**:

- Added: `apps/nextjs/src/app/[lang]/(auth)/error.tsx`
- Added: `apps/nextjs/src/app/[lang]/(dashboard)/error.tsx`

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
