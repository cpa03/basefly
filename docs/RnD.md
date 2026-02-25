#R&D Documentation

## Active R&D Work

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
