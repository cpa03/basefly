# BugLover - Bug Tracking Document

## Active Bugs

## Fixed Bugs

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

