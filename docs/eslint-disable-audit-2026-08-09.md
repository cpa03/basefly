# eslint-disable Audit Report — 2026-08-09

**Issue:** #663 — "[DX] Consolidate eslint-disable comments across codebase (excluding tests)"
**Evaluation date:** 2026-08-09
**Branch:** `fix/consolidate-eslint-disable-663-loop65`
**Method:** every instance verified empirically with `eslint --no-inline-config` (reveals exactly what each inline disable suppresses).

## Summary

- **31 non-test `eslint-disable` instances** across 22 files were audited (tests excluded per issue scope).
- **2 instances removed** by fixing a real root cause (missing return types on `SoftDeleteService` — see below).
- **29 instances remain, all verified necessary**: removing any of them produces genuine ESLint errors. The issue's "<5 instances" target is **not safely achievable** without globally disabling type-safety rules (which would mask real `any`-typed code and reduce type safety — the opposite of the issue's intent).

## Root-Cause Categories (verified via `eslint --no-inline-config`)

| #   | Root cause                                                                                                                                                                                         | Instances | Files                                                                                                                                                                                                                                                                                                                                                                                                                                    | Verdict                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | tRPC v10 proxy types are dynamically resolved (`experimental_createTRPCNextAppDirClient` / `createTRPCProxyClient` / `createCaller` return `any`-typed proxies) → `@typescript-eslint/no-unsafe-*` | 16        | `trpc/client.ts`, `trpc/shared.ts`, `trpc/server.ts`, `components/price/billing-form-button.tsx`, `components/dashboard/cluster-list.tsx`, `components/k8s/cluster-config.tsx`, `components/k8s/cluster-create-button.tsx`, `components/user-name-form.tsx`, `app/[lang]/(dashboard)/dashboard/billing/page.tsx`, `app/[lang]/(dashboard)/dashboard/page.tsx`, `app/[lang]/(marketing)/pricing/page.tsx`, `app/admin/dashboard/page.tsx` | **Necessary** — tRPC client proxy typing; resolving would require a router-wide typed-caller refactor (out of scope for consolidation) |
| 2   | Generic `SoftDeleteService<T extends keyof DB>` operates on dynamic Kysely table names → unsafe call/member-access on the query builder                                                            | 1         | `packages/db/soft-delete.ts` (class-level block)                                                                                                                                                                                                                                                                                                                                                                                         | **Necessary** — dynamic table access is inherent to the generic design                                                                 |
| 3   | `react-hooks/purity` + `react-hooks/set-state-in-effect` (v5/6 rules) flag intentional lazy ref-init / effect-set patterns                                                                         | 3         | `packages/ui/src/meteors.tsx`, `packages/ui/src/background-lines.tsx`, `packages/ui/src/infinite-moving-cards.tsx`                                                                                                                                                                                                                                                                                                                       | **Necessary** — `Math.random()` lazy-init via ref is the correct React pattern for one-time per-prop styling                           |
| 4   | `react/no-unknown-property` on cmdk library attribute                                                                                                                                              | 1         | `packages/ui/src/command.tsx` (`cmdk-input-wrapper=""`)                                                                                                                                                                                                                                                                                                                                                                                  | **Necessary** — cmdk CSS relies on this attribute; renaming breaks styling                                                             |
| 5   | Dependency typing gaps (Kysely `db.execute`, Stripe `balance.retrieve`, `isClerkEnabled`, cookie store)                                                                                            | 4         | `apps/nextjs/src/lib/health-check.ts` (3), `apps/nextjs/src/trpc/server.ts` (1, `cookies().getAll()`)                                                                                                                                                                                                                                                                                                                                    | **Necessary** — types not fully resolved by ESLint's type-aware rules                                                                  |
| 6   | Ambient/declaration files and Tailwind plugin internals                                                                                                                                            | 4         | `apps/nextjs/cloudflare-env.d.ts` (2 blocks), `tooling/tailwind-config/index.ts` (2)                                                                                                                                                                                                                                                                                                                                                     | **Necessary** — Cloudflare ambient types and untyped `tailwindcss/lib` internals                                                       |

Additionally `packages/api/src/rate-limiter.ts` (1) suppresses `prefer-nullish-coalescing` where `||` is **semantically intentional** (empty string must fall through to the next header) — documented in-code; converting to `??` would change behavior.

## Fix Applied (root-cause, not suppression)

`packages/db/soft-delete.ts` — added explicit return types to the 5 `SoftDeleteService` methods, making the service's public contract safe for callers:

```ts
findActive(id: number, userId: string): Promise<DB[T] | undefined>
findAllActive(userId: string): Promise<DB[T][]>
findDeleted(userId: string): Promise<DB[T][]>
countActive(userId: string): Promise<number>
countDeleted(userId: string): Promise<number>
```

This allowed removing **2 `eslint-disable` comments** in `packages/api/src/router/k8s.ts` (lines 46, 71) — `@typescript-eslint/no-unsafe-assignment` / `no-unsafe-return` were only needed because the service's return type was implicit. (Revives the never-merged fix from branch `fix/649-remove-eslint-disable-k8s-router`.)

## Verification

| Check                                 | Command                                                                                                                     | Result                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Lint (all packages)                   | `pnpm lint`                                                                                                                 | 9/9 clean, zero warnings                  |
| Typecheck (all packages)              | `pnpm typecheck`                                                                                                            | 9/9 clean                                 |
| Targeted tests                        | `vitest run packages/db/soft-delete.test.ts packages/api/src/router/k8s.test.ts packages/api/src/router/k8s-router.test.ts` | 3 files / 99 tests pass                   |
| Full test suite                       | `vitest run`                                                                                                                | 88 files / 1639 tests pass                |
| `eslint --no-inline-config` on k8s.ts | (post-fix)                                                                                                                  | **clean** — disables provably unnecessary |

## Conclusion

Remaining 29 instances are all documented, justified suppressions of genuine ESLint findings (mostly tRPC dynamic proxy typing and React purity rules). Further reduction to <5 would require either a router-wide typed-caller refactor or weakening `@typescript-eslint/no-unsafe-*` in config — both are scope expansions beyond consolidation and would trade away type safety. Recommended follow-up (new issue, not this one): migrate the Next.js app to typed `trpc.createCaller`/server components to eliminate the tRPC cluster (~16 instances).
