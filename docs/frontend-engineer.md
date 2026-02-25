# Frontend Engineer - Long-term Memory

## Overview

This document serves as the long-term memory for the frontend-engineer domain in the OpenX Basefly project.

## Current State (2026-02-25)

### Focus Areas

- UI Component Library maintenance
- Performance optimization
- Accessibility improvements
- Bundle size management

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

### Recent Work

- Created COMPONENTS.md documentation categorizing all 54 components
- Categorized components into Core (stable) vs Marketing Effects (experimental)
- Identified which components are actually used in apps/nextjs

## Open Issues

- #592 - [P2][Performance] Optimize bundle size
- #590 - [P2][Architecture] Audit UI component library for enterprise readiness
- #521 - [P2][Frontend] Review hydration consistency with client dictionary loading
- #492 - frontend: Add proper sizes attribute for responsive images
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
6. Create PR with frontend-engineer label

## Notes

- Package exports configured via package.json "exports" field
- Individual imports via subpath (e.g., `@saasfly/ui/button`)
- Only 5 components in barrel export (index.ts) - good for tree-shaking!
