# Frontend Engineer - Long-term Memory

## Overview

This document serves as the long-term memory for the frontend-engineer domain in the OpenX Basefly project.

## Current State (2026-02-26)

### Focus Areas

- UI Component Library maintenance
- Performance optimization
- Accessibility improvements
- Bundle size management
- Test coverage for frontend code

### UI Component Inventory

- Total components: 54
- Core (stable): 34 components
- Marketing effects (experimental): 19 components
- Utilities: 1

### Key Files

- Package: `packages/ui/`
- Documentation: `packages/ui/COMPONENTS.md`
- Components: `packages/ui/src/*.tsx`
- Barrel export: `packages/ui/src/index.ts`

### Test Infrastructure

- Test framework: Vitest with happy-dom environment
- Test location: `apps/nextjs/src/**/*.test.ts*`
- Setup file: `apps/nextjs/src/test/setup.tsx`
- Testing libraries: @testing-library/react, @testing-library/jest-dom, @testing-library/dom

### Recent Work

- PR #679: Add unit tests for UI components in apps/nextjs (fixes #665)
- PR #672: Add error boundary to (auth) route group (fixes #666)
- PR #662: Add sizes attribute to Next.js Image components (fixes #492)
- Created COMPONENTS.md documentation categorizing all 54 components
- Categorized components into Core (stable) vs Marketing Effects (experimental)
- Identified which components are actually used in apps/nextjs
- Added test infrastructure for apps/nextjs with hook tests

## Open Issues

- #665 - [QA] Add unit tests for UI components in apps/nextjs - IN PROGRESS (PR #679)
- #592 - [P2][Performance] Optimize bundle size
- #590 - [P2][Architecture] Audit UI component library for enterprise readiness
- #521 - [P2][Frontend] Review hydration consistency with client dictionary loading
- #485 - frontend: Add Suspense boundaries for granular loading states
- #484 - frontend: Improve accessibility with consistent ARIA implementation

## Best Practices

### Component Selection

1. **Production apps** → Use Core components (stable)
2. **Marketing pages** → Marketing effects acceptable but use sparingly
3. **Avoid** → Deprecated components

### Performance

- Use explicit imports (subpath exports) for tree-shaking
- Avoid barrel imports from index.ts for unused components
- Consider lazy loading for marketing effects

### Testing

- All new hooks should have corresponding test files
- Use happy-dom environment for Next.js component tests
- Mock Next.js navigation components in test setup
- Follow existing test patterns in apps/nextjs/src/hooks/

### Accessibility

- All Core components should be WCAG compliant
- Test with keyboard navigation
- Use semantic HTML

## Workflow

1. Check for existing frontend-engineer PRs
2. Pick an open issue with frontend-engineer label
3. Create feature branch
4. Implement fix/feature
5. Run lint/format
6. Run tests
7. Create PR with frontend-engineer label

## Notes

- Package exports configured via package.json "exports" field
- Individual imports via subpath (e.g., `@saasfly/ui/button`)
- Only 5 components in barrel export (index.ts) - good for tree-shaking!
- Issue #665 established test infrastructure for apps/nextjs
