# UI Component Library - Component Catalog

This document provides a comprehensive catalog of all 54 components in the `@saasfly/ui` package, categorized by their intended use case and stability level.

## Categories

### Core Components (Enterprise SaaS Essential)

These components form the foundation of the enterprise SaaS application and are considered **stable**.

### Extended Components (Business UI)

These components extend core functionality and are considered **stable**.

### Marketing Effects (Visual/Animation)

These components are primarily used for marketing pages and visual effects. They are considered **experimental** and may change between versions.

---

## Component Catalog

### Core Components (Stable)

| Component          | Status    | Used in App | Notes                               |
| ------------------ | --------- | ----------- | ----------------------------------- |
| `button`           | ✅ Stable | ✅ Yes      | Primary CTA component with variants |
| `button-variants`  | ✅ Stable | ✅ Yes      | CVA configuration                   |
| `card`             | ✅ Stable | ✅ Yes      | Container component for content     |
| `card-skeleton`    | ✅ Stable | ✅ Yes      | Loading skeleton for cards          |
| `form`             | ✅ Stable | ✅ Yes      | React Hook Form integration         |
| `input`            | ✅ Stable | ✅ Yes      | Text input component                |
| `label`            | ✅ Stable | ✅ Yes      | Form label                          |
| `select`           | ✅ Stable | ✅ Yes      | Dropdown select                     |
| `tabs`             | ✅ Stable | ✅ Yes      | Tabbed interface                    |
| `dialog`           | ✅ Stable | ✅ Yes      | Modal dialog                        |
| `sheet`            | ✅ Stable | ❌ No       | Slide-out panel                     |
| `popover`          | ✅ Stable | ❌ No       | Popover content                     |
| `dropdown-menu`    | ✅ Stable | ✅ Yes      | Dropdown menu                       |
| `table`            | ✅ Stable | ✅ Yes      | Data table structure                |
| `data-table`       | ✅ Stable | ❌ No       | TanStack Table integration          |
| `data-table-empty` | ✅ Stable | ❌ No       | Empty state for tables              |
| `alert`            | ✅ Stable | ❌ No       | Alert message                       |
| `alert-dialog`     | ✅ Stable | ✅ Yes      | Confirmation dialog                 |
| `toast`            | ✅ Stable | ✅ Yes      | Toast notification                  |
| `use-toast`        | ✅ Stable | ✅ Yes      | Toast hook                          |
| `toaster`          | ✅ Stable | ✅ Yes      | Toast provider                      |
| `switch`           | ✅ Stable | ✅ Yes      | Toggle switch                       |
| `checkbox`         | ✅ Stable | ❌ No       | Checkbox input                      |
| `avatar`           | ✅ Stable | ✅ Yes      | User avatar                         |
| `skeleton`         | ✅ Stable | ✅ Yes      | Loading skeleton                    |
| `tooltip`          | ✅ Stable | ✅ Yes      | Tooltip overlay                     |
| `scroll-area`      | ✅ Stable | ❌ No       | Scrollable container                |
| `command`          | ✅ Stable | ✅ Yes      | Command palette                     |
| `status-badge`     | ✅ Stable | ✅ Yes      | Status indicator                    |
| `calendar`         | ✅ Stable | ❌ No       | Date picker                         |
| `copy-button`      | ✅ Stable | ❌ No       | Copy to clipboard                   |
| `textarea`         | ✅ Stable | ❌ No       | Multi-line input                    |
| `icons`            | ✅ Stable | ✅ Yes      | Lucide icons                        |

### Marketing Effects (Experimental)

| Component                    | Status          | Used in App | Notes                      |
| ---------------------------- | --------------- | ----------- | -------------------------- |
| `meteors`                    | 🔶 Experimental | ✅ Yes      | Meteor animation effect    |
| `marquee`                    | 🔶 Experimental | ✅ Yes      | Scrolling marquee          |
| `wobble-card`                | 🔶 Experimental | ✅ Yes      | Wobble animation card      |
| `text-reveal`                | 🔶 Experimental | ✅ Yes      | Text reveal animation      |
| `text-generate-effect`       | 🔶 Experimental | ✅ Yes      | Typewriter text effect     |
| `typewriter-effect`          | 🔶 Experimental | ✅ Yes      | Alternative typewriter     |
| `animated-gradient-text`     | 🔶 Experimental | ✅ Yes      | Gradient text animation    |
| `animated-list`              | 🔶 Experimental | ✅ Yes      | List animation             |
| `animated-tooltip`           | 🔶 Experimental | ✅ Yes      | Animated tooltip           |
| `infinite-moving-cards`      | 🔶 Experimental | ✅ Yes      | Infinite card scroll       |
| `sparkles`                   | 🔶 Experimental | ❌ No       | Sparkle particle effect    |
| `glowing-effect`             | 🔶 Experimental | ✅ Yes      | Glowing border effect      |
| `following-pointer`          | 🔶 Experimental | ✅ Yes      | Following cursor effect    |
| `shake-wrapper`              | 🔶 Experimental | ❌ No       | Shake animation            |
| `3d-card`                    | 🔶 Experimental | ❌ No       | 3D card effect             |
| `colorful-text`              | 🔶 Experimental | ✅ Yes      | Colorful gradient text     |
| `container-scroll-animation` | 🔶 Experimental | ✅ Yes      | Scroll-triggered animation |
| `background-lines`           | 🔶 Experimental | ✅ Yes      | Background line pattern    |
| `card-hover-effect`          | 🔶 Experimental | ✅ Yes      | Hover animation effect     |

### Email Components

| Component          | Status          | Used in App | Notes                 |
| ------------------ | --------------- | ----------- | --------------------- |
| `magic-link-email` | 🔶 Experimental | ❌ No       | React Email component |

### Utilities

| Component | Status    | Used in App | Notes                                     |
| --------- | --------- | ----------- | ----------------------------------------- |
| `cn`      | ✅ Stable | ✅ Yes      | Classname utility (clsx + tailwind-merge) |
| `callout` | ✅ Stable | ✅ Yes      | Callout/notice box                        |

---

## Usage Statistics

| Category          | Total  | Used in App | Not Used |
| ----------------- | ------ | ----------- | -------- |
| Core Components   | 34     | 21          | 13       |
| Marketing Effects | 19     | 15          | 4        |
| Email Components  | 1      | 0           | 1        |
| Utilities         | 2      | 2           | 0        |
| **Total**         | **56** | **38**      | **18**   |

---

## Bundle Optimization Notes

### Barrel Export (index.ts)

The barrel export (`packages/ui/src/index.ts`) now only exports:

- `cn` - Classname utility
- `buttonVariants` - Button variant configuration

This minimal barrel export ensures optimal tree-shaking. Only import components you need via subpath imports:

```typescript
// Good - explicit import for tree-shaking
import { Button } from "@saasfly/ui/button";

// Avoid - barrel import may include unused code
// import { Button } from "@saasfly/ui";
```

### Unused Components

The following 18 components are NOT used in the main application and could be candidates for:

1. Future use
2. Package splitting (@saasfly/ui-marketing)
3. Deprecation

**Core (13):** sheet, popover, data-table, data-table-empty, alert, checkbox, scroll-area, calendar, copy-button, textarea, form, magic-link-email

**Marketing (4):** sparkles, shake-wrapper, 3d-card

---

## Recommendations

### For Enterprise SaaS Applications

Use **Core Components** for production applications. These are:

- Well-tested
- API stable
- Accessible (WCAG compliant)
- Themable

### For Marketing Pages

Marketing Effects can be used but should be aware:

- May impact performance
- Not recommended for dashboard/application UIs
- Consider accessibility implications

### Component Split Proposal

The issue #590 suggests splitting the package into:

```
@saasfly/ui          - Core business components (stable)
@saasfly/ui/marketing - Marketing effects (experimental)
```

This would allow teams to:

- Import only what they need
- Clearly identify production-safe components
- Reduce bundle size for production apps

---

## Stability Levels

- ✅ **Stable**: Production-ready, semantic versioning, comprehensive tests
- 🔶 **Experimental**: May change without notice, use with caution
- ⚠️ **Deprecated**: Do not use, will be removed in future versions

---

## Contributing

When adding new components:

1. Choose appropriate category (core vs marketing)
2. Add stability level comment
3. Update this document
4. Add tests for core components

Last Updated: 2026-02-25
