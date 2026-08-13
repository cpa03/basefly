# UI Component Library — Enterprise Readiness Audit

> **Status**: Audited 2026-08-13 — Issue #590
>
> This audit assesses `packages/ui` (`@saasfly/ui`) against enterprise
> readiness criteria: accessibility, theming, test coverage, API design,
> performance, documentation, and SSR compatibility. All findings were
> verified against the repository at commit `HEAD` of `main`.

## Methodology

- Inventory of `packages/ui/src` (components, tests, exports).
- Static review of representative components (`button`, `data-table`,
  `dialog`, `form`, `command`, `calendar`).
- `package.json` inspection: `exports` map, `peerDependencies`,
  dependency set, lint/typecheck config.
- Grep-based checks for a11y attributes, `dark:` tokens, `"use client"`
  directives, theme providers, and usage documentation.
- Health baseline: `pnpm typecheck` 9/9, `pnpm lint` 9/9 (0 warnings),
  `pnpm test` 97 files / 1733 tests pass.

## Inventory (verified 2026-08-13)

| Metric | Count |
|--------|-------|
| Components (`src/*.tsx`, excluding tests) | 54 |
| Test files (`*.test.tsx` / `*.test.ts`) | 15 |
| Components with direct a11y attributes (`aria-*` / `role`) | 22 |
| Components using `dark:` tokens | 7 |
| `"use client"` directives | present on interactive components |
| Subpath exports declared | 57 |
| Theme provider (e.g. `next-themes`) | none in package |
| Storybook / component gallery | none |
| Usage documentation in `docs/` | none |

## Criteria Assessment

### 1. Accessibility — Score: 8/10

**Observations**

- Most primitives are built on **Radix UI** primitives
  (`@radix-ui/react-*`: dialog, dropdown, tabs, tooltip, select, switch,
  toast, accordion, alert-dialog, …), which provide keyboard navigation,
  focus management, ARIA roles, and `aria-*` wiring out of the box.
- 22 of 54 components additionally declare explicit `aria-*` / `role`
  attributes (e.g. `button` loading state, `copy-button` labelled
  feedback).
- Recent accessibility fixes are present: `alert-dialog`/`sheet` gained
  `aria-modal`; mobile nav uses `aria-current` (PRs on `main`).

**Gaps**

- Decor/marketing components (`3d-card`, `animated-*`, `meteors`,
  `sparkles`, `typewriter-effect`, `wobble-card`, …) have no a11y review;
  decorative canvases/framer-motion elements can trap focus or convey no
  meaning to AT users without explicit `aria-hidden` handling.
- No dedicated axe/`jest-axe` automated a11y assertions in component
  tests.

**Evidence**: `src/button.tsx` (Radix Slot + `aria-busy` loading state);
`src/*.test.tsx` — no a11y assertions present.

### 2. Theming & Customization — Score: 7/10

**Observations**

- Variant system via `class-variance-authority` + `tailwind-merge` +
  `clsx` (`button-variants.ts`, exported and reused).
- Design tokens centralized in `@saasfly/common` (`BUTTON_TOKENS`,
  `UI_ANIMATION`, `UI_STRINGS`), consumed by components.
- 7 components reference `dark:` variants.

**Gaps**

- **No theme provider** in the package (`next-themes` absent). Dark-mode
  styling is CSS-only `dark:` classes; the app must supply its own theme
  class strategy. Enterprise consumers expect a documented theming
  contract (CSS variables vs. Tailwind class strategy).
- Token coverage is partial — many decorative components hardcode
  animation/color values instead of consuming tokens.

**Evidence**: `package.json` (no `next-themes`); `grep dark: src/*.tsx`
→ 7 files; `button.tsx` consumes `BUTTON_TOKENS` but `animated-*`
components embed literals.

### 3. Test Coverage — Score: 5/10

**Observations**

- 15 test files cover the core form/feedback primitives: `button`,
  `button-variants`, `input`, `label`, `card`, `checkbox`, `alert`,
  `callout`, `accordion`, `avatar`.
- CI enforces tests repo-wide (`pnpm test`, 1733 tests green).

**Gaps**

- **~28% coverage**: 15/54 components tested. Untested: `dialog`,
  `dropdown-menu`, `data-table`, `command`, `calendar`, `form`, `tabs`,
  `select`, `popover`, `tooltip`, `toast`, `sheet`, `switch`, `table`,
  `textarea`, `copy-button`, `use-toast`, and all decorative components.
- No interaction tests (`@testing-library/user-event`) for keyboard
  flows; no a11y assertions.

**Evidence**: `ls src/*.test.*` → 15 files; untested list above.

### 4. API Design & Consumability — Score: 9/10

**Observations**

- **Subpath exports** (`./dialog`, `./button`, …) declared in
  `package.json` → consumers import only what they use (tree-shaking
  friendly). 57 subpaths + `"."` entry.
- `typesVersions` maps `src/*` for TS consumers.
- `peerDependencies` correct: `next >= 14`, `react ^19`, `react-dom ^19`
  (Issue #789 addressed).
- TypeScript strict (`tooling/typescript-config/base.json`), eslint
  base+react configs applied.

**Gaps**

- `index.ts` barrel exports only 3 symbols — the main entry is thin;
  consumers must know subpath names (documented nowhere in `docs/`).
- No public API versioning policy or deprecation path.

**Evidence**: `package.json` `exports` (57 entries); `src/index.ts`
(3 exports); `docs/` has no `@saasfly/ui` usage guide.

### 5. Performance & Bundle Size — Score: 7/10

**Observations**

- `"use client"` only on interactive components; server-safe components
  stay on the server.
- Subpath exports enable per-component imports (no barrel forcing).
- Bundle analyzer configured (`@next/bundle-analyzer` in
  `apps/nextjs/next.config.mjs` — Issue #708 addressed).

**Gaps**

- Heavy animation dependencies (`framer-motion`, `three`/`@react-three/*`,
  `@tsparticles/*`, `three-globe`) are bundled into the UI package —
  decorative components pull significant weight into any consumer that
  imports the package root. `data-table` pulls `@tanstack/react-table`
  (devDependency only — good).
- No per-component bundle budget / size regression guard.

**Evidence**: `package.json` dependencies; `next.config.mjs` line 6.

### 6. Documentation & Developer Experience — Score: 4/10

**Observations**

- Doc comments present on key exports (`button-variants` JSDoc).
- Export boundaries documented repo-wide (Issue #667 deliverable,
  `docs/export-boundaries.md`).

**Gaps**

- **No Storybook**, no component gallery, no `docs/ui/*` usage pages.
- No API reference for component props/variants.
- No theming/token guide.
- Consumers must read source to discover subpath exports and variants.

**Evidence**: no `.storybook/`; `grep -rln "@saasfly/ui" docs/*.md` → no
matches.

### 7. SSR / Runtime Compatibility — Score: 8/10

**Observations**

- `"use client"` correctly scoped; Radix + React 19 compatible.
- Components avoid `window`/`document` access at module scope (ripple
  effects are event-driven in `button.tsx`).

**Gaps**

- `use-toast.tsx` / `toaster.tsx` assume client context (correctly
  marked) — no SSR-safe fallback docs.
- No RSC/streaming-specific smoke tests for server components.

**Evidence**: `data-table.tsx`, `button.tsx` `"use client"` headers.

## Findings Summary

| # | Finding | Severity | Domain |
|---|---------|----------|--------|
| 1 | ~72% of components lack tests (39/54) | High | Testability |
| 2 | No a11y assertions (jest-axe) in tests | Medium | Accessibility |
| 3 | No theme provider / theming contract | Medium | Theming/UX |
| 4 | No Storybook / component documentation | Medium | DX |
| 5 | Heavy animation deps in package root | Medium | Performance |
| 6 | Decor components lack a11y review | Low | Accessibility |
| 7 | Thin barrel (`index.ts` 3 exports) | Low | API clarity |

## Recommendations (prioritized)

1. **P1 — Test the 14 high-value interactive primitives**: `dialog`,
   `dropdown-menu`, `select`, `tabs`, `tooltip`, `popover`, `sheet`,
   `switch`, `table`, `data-table`, `command`, `calendar`, `form`,
   `toast`/`use-toast` — interaction + a11y assertions
   (`@testing-library/user-event`, `jest-axe`).
2. **P2 — Add a theming contract**: ship a `ThemeProvider` (or document
   the `dark:` class strategy) + CSS-variable token layer for
   enterprise white-labeling.
3. **P2 — Component documentation**: Storybook stories for the 20 most
   consumed components, or a `docs/ui/*` usage guide with props tables.
4. **P3 — Per-component bundle budgets** via the existing
   `@next/bundle-analyzer` + size regression check for `packages/ui`
   imports.
5. **P3 — A11y pass on decorative components** (`aria-hidden` on purely
   decorative canvases, `prefers-reduced-motion` handling).

## Verdict

`packages/ui` is **enterprise-ready in architecture** (Radix-based,
strict TS, subpath exports, token-aware core primitives) and
**not yet enterprise-ready in coverage and documentation**. The core
form/feedback surface (button, input, card, checkbox, alert, accordion,
avatar) is tested and accessible; the interactive data surface
(data-table, command, calendar, form, overlays) and the documentation
story are the two highest-value gaps. See Issue #590 for tracking.
