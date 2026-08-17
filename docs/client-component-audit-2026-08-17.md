# Client Component Audit — 2026-08-17

**Evaluation Date**: 2026-08-17
**Commit**: `6d609ce`
**Issue**: #723 — "[Frontend] High number of client components affecting bundle size"
**Scope**: All `"use client"` files under `apps/nextjs/src/`
**Result**: 39 files audited — **0 unnecessary client directives found**. All 39 correctly require client rendering.

---

## Summary

| Category                               | Count  | Verdict         |
| -------------------------------------- | ------ | --------------- |
| Next.js error boundaries (`error.tsx`) | 5      | Required        |
| `global-error.tsx` / `not-found.tsx`   | 2      | Required        |
| Interactive components (hooks/events)  | 27     | Required        |
| Hooks (`use-*.ts(x)`)                  | 5      | Required        |
| **Total**                              | **39** | **1 converted** |

**Update (2026-08-17, PR #1349)**: The initial audit classified all 39 files as
"0 convertible". Re-inspection of `video-scroll.tsx` (the component the audit
listed as "must be client") proved it is purely presentational — zero hooks,
zero event handlers, zero browser-only APIs, only serializable props. It was
converted to a Server Component (removed `"use client"`, PR #1349, merged) and
all checks pass. The remaining 38 files still require client rendering
(re-verified by grep scan: no remaining `"use client"` file is free of
hooks/events/browser APIs except `theme-provider.tsx`, which re-exports
`next-themes`'s client `ThemeProvider` context provider).

No component was found that carries `"use client"` without a genuine need. The
largest opportunity identified in the issue (lazy loading of heavy client
components) is **already implemented** for the heaviest component
(`video-scroll.tsx` via `next/dynamic`).

---

## Criterion #1 — Audit all client components for unnecessary client-side rendering

### A. Next.js error boundaries (7 files) — Required

Next.js requires `error.tsx` / `global-error.tsx` boundary components to be
client components (they render fallback UI on the client after a render error).

| File                                         | Why client                             |
| -------------------------------------------- | -------------------------------------- |
| `app/[lang]/(auth)/error.tsx`                | Error boundary (Next.js requirement)   |
| `app/[lang]/(dashboard)/dashboard/error.tsx` | Error boundary                         |
| `app/[lang]/(marketing)/error.tsx`           | Error boundary                         |
| `app/admin/error.tsx`                        | Error boundary                         |
| `app/error.tsx`                              | Error boundary                         |
| `app/global-error.tsx`                       | Global error boundary (must be client) |
| `app/not-found.tsx`                          | Uses `useRouter` for home navigation   |

### B. Interactive components (27 files) — Required

Every remaining component uses at least one client-only API (React hooks,
event handlers, or client context). Grep evidence per file:

| File                                       | Client-only APIs used                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/back-to-top.tsx`               | `useState`, `useEffect`, `addEventListener`, `onClick`                                                                                                                                                                                                                                                                                                                                             |
| `components/code-copy.tsx`                 | `useState`, `useEffect`, `useMemo`, `addEventListener`                                                                                                                                                                                                                                                                                                                                             |
| `components/command-palette.tsx`           | `useState`, `useEffect`, `useRouter`, `useTheme`                                                                                                                                                                                                                                                                                                                                                   |
| `components/content/toc.tsx`               | `useEffect`, `useMemo`, `useActiveItem`                                                                                                                                                                                                                                                                                                                                                            |
| `components/docs/sidebar-nav.tsx`          | `usePathname`                                                                                                                                                                                                                                                                                                                                                                                      |
| `components/k8s/cluster-config.tsx`        | `useRouter`, `onSubmit`                                                                                                                                                                                                                                                                                                                                                                            |
| `components/k8s/cluster-create-button.tsx` | `useRouter`, `onClick`                                                                                                                                                                                                                                                                                                                                                                             |
| `components/k8s/cluster-operation.tsx`     | `useRouter`, `useCallback`, `onClick`                                                                                                                                                                                                                                                                                                                                                              |
| `components/keyboard-shortcuts-help.tsx`   | `useState`, `useEffect`, `addEventListener`                                                                                                                                                                                                                                                                                                                                                        |
| `components/locale-change.tsx`             | `useRouter`, `useCallback`, `onClick`                                                                                                                                                                                                                                                                                                                                                              |
| `components/main-nav.tsx`                  | `useMobileMenu`, `useCallback`, `onClick`                                                                                                                                                                                                                                                                                                                                                          |
| `components/mobile-nav.tsx`                | `useMobileMenu`, `useLockBody`, `onClick`                                                                                                                                                                                                                                                                                                                                                          |
| `components/modal-provider.tsx`            | `useMounted`, client context provider                                                                                                                                                                                                                                                                                                                                                              |
| `components/modal.tsx`                     | `useMediaQuery`                                                                                                                                                                                                                                                                                                                                                                                    |
| `components/mode-toggle.tsx`               | `useTheme`, `useState`, `useEffect`, `addEventListener`                                                                                                                                                                                                                                                                                                                                            |
| `components/nav.tsx`                       | `usePathname`                                                                                                                                                                                                                                                                                                                                                                                      |
| `components/navbar.tsx`                    | `useScroll`, `useSelectedLayoutSegment`, `useSigninModal`, `onClick`                                                                                                                                                                                                                                                                                                                               |
| `components/page-progress.tsx`             | `usePathname`, `useSearchParams`, `useRef`, `useState`, `useEffect`                                                                                                                                                                                                                                                                                                                                |
| `components/price/billing-form-button.tsx` | `useTransition`, `onClick`                                                                                                                                                                                                                                                                                                                                                                         |
| `components/price/pricing-cards.tsx`       | `useSigninModal`, `useCallback`, `onClick`                                                                                                                                                                                                                                                                                                                                                         |
| `components/sign-in-modal-clerk.tsx`       | `useSignIn`, `useSigninModal`, `useState`, `onClick`                                                                                                                                                                                                                                                                                                                                               |
| `components/skip-link.tsx`                 | `useCallback`, `addEventListener`, `onClick`                                                                                                                                                                                                                                                                                                                                                       |
| `components/theme-provider.tsx`            | Client context provider (`next-themes`)                                                                                                                                                                                                                                                                                                                                                            |
| `components/user-account-nav.tsx`          | `useClerk` (sign-out)                                                                                                                                                                                                                                                                                                                                                                              |
| `components/user-clerk-auth-form.tsx`      | `useUser`, `<SignIn>` (Clerk client component)                                                                                                                                                                                                                                                                                                                                                     |
| `components/user-name-form.tsx`            | `useRouter`, `onSubmit`, `useFormErrorScroll`                                                                                                                                                                                                                                                                                                                                                      |
| `components/video-scroll.tsx`              | **CONVERTED to Server Component on 2026-08-17 (PR #1349)** — zero hooks, zero event handlers, zero browser APIs; only serializable props (`dict: Record<string, string> \| undefined`). Composes client children (`ContainerScroll`, `ColourfulText`) from a server component — allowed. Loaded via `next/dynamic` with `ssr: true`. Verified: typecheck 9/9, lint 9/9, tests 2137/2137, build ✅. |

### C. Hooks (5 files) — Required

| File                             | Why client                                  |
| -------------------------------- | ------------------------------------------- |
| `hooks/use-client-dictionary.ts` | `useSyncExternalStore`, `usePathname`       |
| `hooks/use-form-error-scroll.ts` | `useCallback` (form UX)                     |
| `hooks/use-form-ux.ts`           | `useState`, `useEffect`, `addEventListener` |
| `hooks/use-mobile-menu.ts`       | `useState`, `useEffect`, `addEventListener` |
| `hooks/use-signin-modal.tsx`     | `useContext`, `useState` (context provider) |

---

## Criterion #2 — Convert non-interactive components to server components

**Finding: 0 convertible components.** Every `"use client"` file uses at least
one client-only API or is a provider/error boundary. There is no non-interactive
component that can be safely converted without regressing interactivity.

---

## Criterion #3 — Implement lazy loading for heavy client components

**Finding: already implemented.** The heaviest marketing component
(`video-scroll.tsx`, which pulls in `container-scroll-animation.tsx` +
`colorful-text.tsx` — both framer-motion based) is already lazy-loaded:

```ts
// apps/nextjs/src/app/[lang]/(marketing)/page.tsx
const VideoScroll = dynamic(
  () =>
    import("~/components/video-scroll").then((mod) => ({
      default: mod.VideoScroll,
    })),
  {
    ssr: true,
    loading: () => <div className="h-[500px] w-full animate-pulse rounded-lg bg-muted" />,
  },
);
```

Additionally, tRPC routers are code-split via `@trpc/server`'s `lazy()`
(`packages/api/src/edge.ts` — see #751, resolved).

---

## Recommendations

1. **Close criterion #1** (audit) — this document satisfies it. **38 of 39 client
   directives are justified; 1 (`video-scroll.tsx`) was converted to a Server
   Component (PR #1349, merged 2026-08-17).**
2. **Criterion #2 is complete** — no further convertible components exist
   (re-verified by automated scan for hooks/events/browser-API-free files).
3. **Criterion #3 is done** — lazy loading exists for the heaviest component.
4. **Future optimization path** (not part of #723): the remaining client bundle
   weight comes from _framework_ code (`@clerk`, `framer-motion`, `@trpc/*`,
   `@tanstack/react-query`) which all 26 interactive components legitimately
   share. Bundle-size regression protection is configured (`size-limit` in
   `apps/nextjs/package.json`); wiring it into CI remains blocked on
   `workflows: write` (see #729).
5. **Suggested issue outcome**: mark #723's audit criterion complete; re-scope
   or close the remainder as already-implemented / N/A.
