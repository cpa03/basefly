# BugLover - Bug Tracking Document

## Active Bugs

## Fixed Bugs

### [x] cookies() Promise handling in trpc/server.ts
**Date**: 2026-02-07  
**File**: `apps/nextjs/src/trpc/server.ts`  
**Issue**: `cookies()` returns a Promise in Next.js 14 App Router but was called synchronously, causing 'will evaluate to [object Object] when stringified' error  
**Solution**: Added `await cookies()` and stored result in variable before calling `.toString()`  
**Impact**: Fixed TypeScript error, proper async cookie handling

### [x] Unused eslint-disable directives
**Date**: 2026-02-07  
**Files**: 
- `apps/nextjs/src/app/api/webhooks/stripe/route.ts` (3 directives)
- `apps/nextjs/src/components/k8s/cluster-create-button.tsx` (1 directive)  
**Issue**: ESLint disable comments for rules that weren't being triggered  
**Solution**: Removed unused eslint-disable directives  
**Impact**: Clean code, no unnecessary suppressions

### [x] Type imports using value import syntax
**Date**: 2026-02-07  
**Files**: 
- `apps/nextjs/src/trpc/server.ts`
- `apps/nextjs/src/components/document-guide.tsx`
- `apps/nextjs/src/components/sign-in-modal-clerk.tsx`
- `apps/nextjs/src/utils/clerk.ts`  
**Issue**: Type-only imports using `import { Type }` instead of `import type { Type }`  
**Solution**: Changed to proper `import type` syntax  
**Impact**: Better tree-shaking, clearer code intent

### [x] Using `<img>` instead of Next.js `<Image />` component
**Date**: 2026-02-07  
**Files**: 
- `apps/nextjs/src/components/comments.tsx`
- `apps/nextjs/src/components/wobble.tsx`  
**Issue**: Using native `<img>` tags instead of optimized Next.js Image component  
**Solution**: Replaced `<img>` with `<Image />` from next/image, added domains to next.config.mjs  
**Impact**: Better performance, automatic image optimization, improved LCP

### [x] Cyclic dependency between @saasfly/ui and @saasfly/common
**Date**: 2026-02-07  
**File**: `packages/ui/package.json`, `packages/common/package.json`  
**Issue**: Cyclic dependency detected: @saasfly/ui -> @saasfly/common -> @saasfly/ui  
**Solution**: Moved MagicLinkEmail component from @saasfly/common to @saasfly/ui package to break the cycle  
**Impact**: Turbo build and typecheck now working correctly

## Recent Improvements

### Phase 1: Palette 🎨 - UX Micro-Improvements (2026-02-07)

**File:** `apps/nextjs/src/components/locale-change.tsx`
- Added proper `aria-label="Change language"` to language switcher button
- Added descriptive `sr-only` text for screen reader support
- Added `aria-hidden="true"` to decorative icon
- Added focus ring and hover transitions for better accessibility

### Phase 2: Flexy 💪 - Modular Configuration (2026-02-07)

**Files Created:**
- `packages/common/src/config/ui.ts` - UI configuration constants
- `packages/common/src/config/resilience.ts` - Circuit breaker and retry configuration

**Files Updated:**
- `packages/ui/src/use-toast.tsx` - Now imports toast limits from config
- `packages/stripe/src/integration.ts` - Now imports all resilience defaults from config
- `packages/common/package.json` - Added explicit exports for config modules

**Improvements:**
- Extracted hardcoded magic numbers to configuration files
- Centralized resilience patterns (circuit breaker, retry, timeout)
- Made UI timing constants configurable
- Easier to adjust behavior without code changes
- Better maintainability and testability

### Configuration Values Extracted:

**Toast Configuration:**
- `TOAST_LIMIT` - Maximum simultaneous toasts
- `TOAST_REMOVE_DELAY` - Delay before DOM removal
- `FEEDBACK_TIMING` - Copy success, toast display, tooltip delays
- `ANIMATION_TIMING` - Standard animation durations

**Resilience Configuration:**
- `CIRCUIT_BREAKER_CONFIG` - Failure threshold, reset timeout
- `RETRY_CONFIG` - Max attempts, base/max delay, backoff multiplier
- `TIMEOUT_CONFIG` - Default, short, long timeout values
- `STRIPE_CONFIG` - Stripe SDK defaults
- `DEFAULT_RETRYABLE_ERRORS` - Retryable error codes

---

## Phase 1: BugLover Fixes (2026-02-07)

### Summary
Fixed critical TypeScript error and cleaned up code quality issues:

**Critical Bug Fixed:**
- `trpc/server.ts`: Fixed async cookies() handling in Next.js 14 App Router

**Code Quality Improvements:**
- Removed 4 unused eslint-disable directives
- Fixed 4 files with proper `import type` syntax
- Replaced 3 `<img>` tags with Next.js `<Image />` component
- Added 2 domains to next.config.mjs for image optimization

**Verification:**
- ✅ ESLint: 0 errors, 0 warnings
- ✅ TypeScript: All packages pass typecheck
- ✅ Tests: All 324 tests passing
- ✅ Build: Clean build with no errors

**Files Modified:**
1. `apps/nextjs/src/trpc/server.ts` - Fixed cookies() Promise handling
2. `apps/nextjs/src/app/api/webhooks/stripe/route.ts` - Removed unused eslint-disable
3. `apps/nextjs/src/components/document-guide.tsx` - Fixed type import
4. `apps/nextjs/src/components/sign-in-modal-clerk.tsx` - Fixed type import
5. `apps/nextjs/src/utils/clerk.ts` - Fixed type import
6. `apps/nextjs/src/components/k8s/cluster-create-button.tsx` - Removed unused eslint-disable
7. `apps/nextjs/src/components/comments.tsx` - Replaced img with Image
8. `apps/nextjs/src/components/wobble.tsx` - Replaced img with Image
9. `apps/nextjs/next.config.mjs` - Added image domains

