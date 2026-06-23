#R&D Documentation

## Active R&D Work

### Issue #686: Remove unused NextAuth database schema

**Status**: PR #689

**Objective**: Remove unused NextAuth database schema from packages/auth to eliminate dead code and confusion.

**Implementation**:

1. **Deleted** `packages/auth/db.ts`:
   - Contained unused NextAuth schema (User, Account, Session, VerificationToken)
   - Never imported or used anywhere in codebase
   - Was creating confusion about authentication approach

2. **Removed unused dependencies** from `packages/auth/package.json`:
   - `kysely: 0.28.11` - only used in db.ts
   - `@vercel/postgres-kysely: 0.10.0` - only used in db.ts
   - `@saasfly/db: workspace:*` - never actually imported in source

**Benefits**:

- **Reduced bundle size**: Removed unused dependencies
- **Improved code clarity**: No more confusion about auth approach (Clerk is the provider)
- **Better maintainability**: Less dead code to maintain
- **Cleaner package**: Only contains actually-used code

**Files Changed**:

- `packages/auth/db.ts` - Deleted (unused NextAuth schema)
- `packages/auth/package.json` - Removed 3 unused dependencies

**Verification**:

- [x] TypeScript typecheck passes (`pnpm --filter @saasfly/auth typecheck`)
- [x] ESLint passes (`pnpm --filter @saasfly/auth lint`)
- [x] All 713 tests pass

---

### Issue #649: Remove eslint-disable comments in k8s.ts router

## Active R&D Work



### Issue #649: Remove eslint-disable comments in k8s.ts router

**Status**: PR #657

**Objective**: Remove eslint-disable comments that were disabling TypeScript safety checks in the k8s router.

**Implementation**:

1. **Removed** eslint-disable comment at line 101:
   - Was disabling: `@typescript-eslint/no-unsafe-assignment`
   - Was disabling: `@typescript-eslint/no-unsafe-member-access`
   - Was disabling: `@typescript-eslint/no-unsafe-return`

2. **Added** explicit type annotation to satisfy ESLint rules:
   - Changed: `const cluster = await k8sClusterService.findActive(clusterId, userId);`
   - To: `const cluster: K8sClusterConfig | undefined = await k8sClusterService.findActive(clusterId, userId);`

3. **Removed** redundant eslint-enable comment at line 126

**Benefits**:

- **Improved type safety**: No more suppressing TypeScript checks
- **Better code quality**: Explicit types make the code more maintainable
- **Fewer potential runtime errors**: Type safety prevents null pointer issues

**Files Changed**:

- `packages/api/src/router/k8s.ts` - Removed eslint-disable comments, added explicit type

**Verification**:

- [x] ESLint comments removed
- [x] Code compiles with explicit types
- [x] Git diff is minimal and focused

---

### Issue #636: ISR Caching for Dashboard Data

### Issue #636: ISR Caching for Dashboard Data

**Status**: PR #648

**Objective**: Implement Incremental Static Regeneration (ISR) for dashboard data to improve performance while maintaining data freshness.

**Implementation**:

1. **Dashboard Page** (`apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx`):
   - Added `export const revalidate = 60` for ISR (60 second revalidation)
   - Keeps `dynamic = "force-dynamic"` for auth but adds ISR cache

2. **K8s Router** (`packages/api/src/router/k8s.ts`):
   - Added `import { revalidatePath } from "next/cache"`
   - Added `revalidatePath("/[lang]/dashboard")` after successful cluster creation
   - Added `revalidatePath("/[lang]/dashboard")` after successful cluster update
   - Added `revalidatePath("/[lang]/dashboard")` after successful cluster deletion

**Benefits**:

- **Performance**: Dashboard loads faster with ISR caching (served from cache for 60 seconds)
- **Data Freshness**: Automatic revalidation ensures data stays fresh
- **Reduced Server Load**: Fewer server-side renders for read-heavy dashboard

**Files Changed**:

- `apps/nextjs/src/app/[lang]/(dashboard)/dashboard/page.tsx` - Added revalidate export
- `packages/api/src/router/k8s.ts` - Added revalidatePath calls

**Verification**:

- [x] TypeScript typecheck passes
- [x] ESLint passes
- [x] Build passes

---

### Issue #549: Add tests for packages/auth module (0% coverage)

## Active R&D Work

### Issue #549: Add tests for packages/auth module (0% coverage)

**Status**: Ready for Merge (PR #564)

**Objective**: Add unit tests for packages/auth module to improve test coverage from 0%.

**Implementation**:

1. **Created** `packages/auth/clerk.test.ts` with 20 test cases covering:
   - `isClerkEnabled()` function:
     - Returns false when env var not set
     - Returns false when key contains 'dummy'
     - Returns false when key contains 'placeholder'
     - Returns false when key doesn't start with 'pk\_'
     - Returns false when key is too short (< 20 chars after prefix)
     - Returns true with valid test key (pk*test*...)
     - Returns true with valid production key (pk*live*...)
   - Logger tests:
     - All logger methods exist (debug, info, warn, error)
     - All methods can be called without throwing
     - Methods handle error objects and metadata correctly
   - authOptions tests:
     - pages.signIn is correctly configured to "/login"

**Files Changed**:

- `packages/auth/clerk.test.ts` - New test file

**Next Steps**:

1. ✅ Run tests locally to verify they pass (VERIFIED: 20/20 tests pass)
2. Consider adding integration tests for getSessionUser() with mocked Clerk auth
3. Add more edge case tests as needed

---

### Issue #523: Barrel Exports Optimization

1. Run tests locally to verify they pass
2. Consider adding integration tests for getSessionUser() with mocked Clerk auth
3. Add more edge case tests as needed

---

### Issue #523: Barrel Exports Optimization

**Status**: Completed

**Objective**: Audit and optimize barrel exports for better tree-shaking in @saasfly/common package.

**Findings**:

1. **packages/ui/src/index.ts**: Already minimal with only 5 exports (cn, Textarea, DataTableEmpty, buttonVariants, CopyButton) - no changes needed.

2. **packages/common/src/index.ts**: Large barrel with 351 lines of exports. Many subpath exports were missing, preventing optimal tree-shaking.

**Analysis Results**:

- 88 files import from @saasfly/common (main barrel)
- 5 files use subpath exports (e.g., @saasfly/common/config/ui)
- Multiple config modules have significant usage but lacked subpath exports

**Implementation**:

1. **Added 13 new subpath exports** in `packages/common/package.json`:
   - `./config/http` - HTTP status codes
   - `./config/headers` - HTTP headers
   - `./config/features` - Feature flags
   - `./config/urls` - Routes and URLs
   - `./config/validation` - Validation configs
   - `./config/pagination` - Pagination settings
   - `./config/cache` - Cache configuration
   - `./config/scroll` - Scroll settings
   - `./config/csp` - CSP headers
   - `./config/env` - Environment variables
   - `./animation` - Animation types
   - `./icon-sizes` - Icon size utilities
   - `./ui-tokens` - UI design tokens

2. **Improved JSDoc documentation** in `packages/common/src/index.ts`:
   - Added comprehensive examples showing both barrel and subpath imports
   - Documented all available subpath exports

**Benefits**:

- Consumers can now import directly from specific modules (e.g., `import { HTTP_STATUS } from "@saasfly/common/config/http"`)
- Better tree-shaking - bundlers can eliminate unused code
- Reduced bundle size potential for consumers who only need specific modules

**Files Changed**:

- `packages/common/package.json` - Added subpath exports
- `packages/common/src/index.ts` - Improved JSDoc documentation

**Next Steps** (for future iterations):

1. Consider adding ESLint rules to encourage subpath imports
2. Monitor bundle size impact after consumers migrate to subpath imports
3. Evaluate removing truly unused exports (carefully, with testing)

---

### Issue #591: Next.js Middleware for Enhanced Request Handling

**Status**: Completed (PR #603)

**Objective**: Add Next.js middleware.ts for enhanced request handling, security headers, and authentication.

**Findings**:

1. No middleware.ts existed in apps/nextjs/src/
2. CSP headers already configured in next.config.mjs
3. Clerk authentication available via @clerk/nextjs but not used as middleware

**Implementation**:

1. **Created** `apps/nextjs/src/middleware.ts`:
   - Uses `clerkMiddleware` from `@clerk/nextjs/server`
   - Defines public routes: `/`, `/sign-in`, `/sign-up`, `/api/trpc/auth`, `/api/webhooks`, `/api/health`
   - Uses `createRouteMatcher` for route pattern matching
   - All other routes require authentication via `auth.protect()`

2. **Security Benefits**:
   - Request-level authentication before hitting API routes
   - Protected routes redirect to sign-in automatically
   - Consistent auth middleware across all protected routes

**Files Changed**:

- `apps/nextjs/src/middleware.ts` (new file)

**Next Steps** (for future iterations):

1. Add request logging middleware for observability
2. Consider geo-blocking capability at edge
3. Add rate limiting at edge level
