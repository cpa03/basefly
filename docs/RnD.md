# R&D Documentation

## Active R&D Work

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
