# UI Component Inventory & Stability Classification

> **Status**: Compiled 2026-08-17 — Issue #590 (acceptance criterion: _Document all UI components with stability level_)
>
> Complements [ui-library-enterprise-audit-2026-08-13.md](./ui-library-enterprise-audit-2026-08-13.md),
> which assesses the library as a whole. This document provides the
> per-component inventory with stability tiers, current test coverage, and
> real usage in `apps/nextjs`.

## Methodology

- Enumerated `packages/ui/src/*.tsx` (54 source files) + `button-variants.ts` (utility).
- Test coverage verified via `ls packages/ui/src/*.test.ts*` → **54/54 components have a test file (100%)**.
  - _Note_: the 2026-08-13 audit reported 15 test files; coverage has since grown to 100%.
- Usage measured by counting `@saasfly/ui/<name>` imports across `apps/nextjs/src`.
- Stability tier reflects: (a) production usage in the app, (b) test coverage,
  (c) enterprise semantics vs. decorative/marketing semantics.

## Stability Tiers

| Tier          | Meaning                                                    | Criteria                                                                                       |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Core**      | Enterprise-grade, production-used                          | Imported by `apps/nextjs`, tested, business/UI semantics (forms, tables, navigation, feedback) |
| **Extended**  | Verified, tested, used on landing/marketing sections       | Imported by `apps/nextjs` (≤2 sites), tested, decorative-but-safe                              |
| **Available** | Standard shadcn/Radix primitives, tested, not yet imported | Tested, stable API, no current app usage                                                       |
| **Marketing** | Decorative/experimental effects, no app usage              | Tested, but animation/canvas effects; enterprise-readiness not established                     |

## Inventory

### Core (23 components + 1 utility)

| Component         | Type      | Tests | App usage  | Notes                                       |
| ----------------- | --------- | ----- | ---------- | ------------------------------------------- |
| `button`          | Component | ✅    | 28 imports | Radix `Slot`-based; loading state, variants |
| `icons`           | Component | ✅    | 34 imports | Lucide wrapper                              |
| `skeleton`        | Component | ✅    | 13 imports | Loading placeholders                        |
| `card`            | Component | ✅    | 12 imports | Surface/container                           |
| `use-toast`       | Hook      | ✅    | 11 imports | Toast state hook                            |
| `status-badge`    | Component | ✅    | 7 imports  | Plan/cluster status indicators              |
| `tooltip`         | Component | ✅    | 6 imports  | Radix tooltip                               |
| `table`           | Component | ✅    | 6 imports  | Data table primitives                       |
| `dropdown-menu`   | Component | ✅    | 6 imports  | Radix dropdown                              |
| `label`           | Component | ✅    | 4 imports  | Radix label                                 |
| `input`           | Component | ✅    | 4 imports  | Form input                                  |
| `dialog`          | Component | ✅    | 4 imports  | Radix dialog                                |
| `button-variants` | Utility   | ✅    | 4 imports  | Variant tokens shared with `button`         |
| `tabs`            | Component | ✅    | 3 imports  | Radix tabs                                  |
| `select`          | Component | ✅    | 3 imports  | Radix select                                |
| `form`            | Component | ✅    | 3 imports  | react-hook-form wrapper                     |
| `avatar`          | Component | ✅    | 3 imports  | Radix avatar                                |
| `alert-dialog`    | Component | ✅    | 3 imports  | Radix alert-dialog (aria-modal)             |
| `accordion`       | Component | ✅    | 2 imports  | Radix accordion                             |
| `toaster`         | Component | ✅    | 1 import   | Toast renderer                              |
| `toast`           | Component | ✅    | 1 import   | Toast item                                  |
| `switch`          | Component | ✅    | 1 import   | Radix switch                                |
| `command`         | Component | ✅    | 1 import   | cmdk wrapper                                |
| `callout`         | Component | ✅    | 1 import   | Info/warning callout                        |

### Extended (12 components — landing/marketing sections)

| Component                    | Tests | App usage | Notes                 |
| ---------------------------- | ----- | --------- | --------------------- |
| `colorful-text`              | ✅    | 2 imports | Gradient text         |
| `text-reveal`                | ✅    | 1 import  | Scroll reveal         |
| `meteors`                    | ✅    | 1 import  | Decorative background |
| `marquee`                    | ✅    | 1 import  | Scrolling strip       |
| `glowing-effect`             | ✅    | 1 import  | Glow decoration       |
| `following-pointer`          | ✅    | 1 import  | Cursor-follow effect  |
| `container-scroll-animation` | ✅    | 1 import  | Scroll animation      |
| `card-hover-effect`          | ✅    | 1 import  | Hover card            |
| `background-lines`           | ✅    | 1 import  | Line background       |
| `animated-tooltip`           | ✅    | 1 import  | Animated tooltip      |
| `animated-list`              | ✅    | 1 import  | List animation        |
| `animated-gradient-text`     | ✅    | 1 import  | Gradient animation    |

### Available (12 components — standard primitives, not yet imported)

| Component          | Tests | App usage | Notes                                            |
| ------------------ | ----- | --------- | ------------------------------------------------ |
| `alert`            | ✅    | 0         | Standard alert (only `alert-dialog` is imported) |
| `calendar`         | ✅    | 0         | Date picker (react-day-picker)                   |
| `card-skeleton`    | ✅    | 0         | Card placeholder                                 |
| `checkbox`         | ✅    | 0         | Radix checkbox                                   |
| `copy-button`      | ✅    | 0         | Clipboard button                                 |
| `data-table`       | ✅    | 0         | TanStack table wrapper                           |
| `data-table-empty` | ✅    | 0         | Empty state                                      |
| `magic-link-email` | ✅    | 0         | Email template                                   |
| `popover`          | ✅    | 0         | Radix popover (refactored in #1334)              |
| `scroll-area`      | ✅    | 0         | Radix scroll area                                |
| `sheet`            | ✅    | 0         | Radix sheet (aria-modal)                         |
| `textarea`         | ✅    | 0         | Form textarea                                    |

### Marketing / Experimental (7 components — decorative, no app usage)

| Component               | Tests | App usage | Notes                     |
| ----------------------- | ----- | --------- | ------------------------- |
| `3d-card`               | ✅    | 0         | Three.js card             |
| `infinite-moving-cards` | ✅    | 0         | Infinite carousel         |
| `sparkles`              | ✅    | 0         | Particle effect           |
| `shake-wrapper`         | ✅    | 0         | Shake animation           |
| `text-generate-effect`  | ✅    | 0         | Text generation animation |
| `typewriter-effect`     | ✅    | 0         | Typewriter                |
| `wobble-card`           | ✅    | 0         | Wobble hover              |

## Enterprise Readiness Summary (updated 2026-08-17)

| Metric                 | 2026-08-13 audit | 2026-08-17 (this inventory) |
| ---------------------- | ---------------- | --------------------------- |
| Components             | 54               | 54                          |
| Test coverage          | 15/54 (28%)      | **54/54 (100%)**            |
| Core (production-used) | not classified   | 23 + 1 utility              |
| Marketing/experimental | 7 flagged        | 7 (unchanged)               |

## Recommendations (traceable to #590)

1. **Stabilize the tier contract**: treat **Core** as the supported API surface
   for enterprise consumers. Semver/patch changes to Core components should be
   gated by the existing test suite (now 100%).
2. **Move Marketing components to a separate subpath/package** (e.g.
   `@saasfly/ui/marketing/*`) to keep the main `@saasfly/ui` export surface
   enterprise-focused. The 7 Marketing components are already isolated by
   subpath exports, so this is a packaging decision, not a code change.
3. **Promote Available → Core as usage lands**: `data-table`, `calendar`,
   `copy-button`, `popover` are the most likely next Core additions; their
   tests already exist.
4. **A11y review for Marketing tier** (from the 2026-08-13 audit): decorative
   canvas/framer-motion components lack explicit `aria-hidden`/focus handling.
   This is the only open gap for the Marketing tier before it can be
   considered enterprise-safe.

## Related

- [UI Library Enterprise Audit (2026-08-13)](./ui-library-enterprise-audit-2026-08-13.md)
- Issue [#590](https://github.com/cpa03/basefly/issues/590)
