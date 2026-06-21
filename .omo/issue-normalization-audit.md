# Issue Normalization Audit

**Date:** 2026-06-21  
**Performed by:** Sisyphus (Autonomous Agent)  
**Status:** Analysis only (GitHub token lacks `issues:write` permission — labels cannot be applied via API)

## Summary

20 open issues analyzed. **None have priority labels** (P0-P3). Several have specialist/domain labels instead of required category labels (bug|enhancement|feature|docs|refactor|chore|test|ci|security).

---

## Issue-by-Issue Normalization

| #   | Title                                                               | Current Labels               | Required Category | Required Priority |
| --- | ------------------------------------------------------------------- | ---------------------------- | ----------------- | ----------------- |
| 789 | Add peerDependencies for React in packages/ui                       | enhancement                  | enhancement       | P3 (Low)          |
| 788 | Add unit tests for critical UI components                           | test                         | test              | P2 (Medium)       |
| 787 | Add unit tests for packages/db migrations and schema                | test                         | test              | P2 (Medium)       |
| 786 | Stripe webhook logs partial secret                                  | security                     | security          | P1 (High)         |
| 785 | Fix duplicate next dependency in packages/stripe/package.json       | bug                          | bug               | P1 (High)         |
| 755 | Add composite index for customer subscription queries               | database-architect           | enhancement       | P3 (Low)          |
| 754 | Add integration tests for Stripe webhook idempotency                | quality-assurance            | test              | P1 (High)         |
| 753 | Implement route-based code splitting for dashboard pages            | frontend-engineer            | enhancement       | P2 (Medium)       |
| 752 | Create unified CLI output utilities                                 | DX-engineer                  | enhancement       | P2 (Medium)       |
| 751 | Optimize tRPC router bundle size with code splitting                | performance-engineer         | enhancement       | P2 (Medium)       |
| 749 | Add AI-powered API endpoint testing and documentation generator     | Growth-Innovation-Strategist | enhancement       | P2 (Medium)       |
| 748 | .nvmrc contains invalid value '20' instead of valid Node.js version | DX-engineer                  | bug               | P2 (Medium)       |
| 744 | fix(ci): pnpm consistency in iterate.yml                            | Growth-Innovation-Strategist | bug               | P2 (Medium)       |
| 731 | Auto-generate API documentation from tRPC routers                   | enhancement                  | enhancement       | P3 (Low)          |
| 729 | Add bundle size regression testing                                  | enhancement                  | enhancement       | P3 (Low)          |
| 728 | Add security scanning workflows to CI                               | security                     | security          | P1 (High)         |
| 727 | AI-Powered Code Review Automation                                   | enhancement                  | enhancement       | P3 (Low)          |
| 726 | Add dependency consistency checking to CI                           | ci                           | ci                | P3 (Low)          |
| 725 | Add integration tests for API routers                               | test                         | test              | P2 (Medium)       |
| 724 | Missing e2e test coverage for critical flows                        | test                         | test              | P1 (High)         |

---

## Duplicate & Similarity Analysis (Steps 2-3)

### Potential Duplicates / Overlaps

**Group: Auto-generated API documentation**

- **#731** — Auto-generate API documentation from tRPC routers (enhancement, P3)
- **#749** — AI-powered API endpoint testing and documentation generator (enhancement, P2)
- **Verdict:** #749 supersedes #731 (covers the same scope plus AI testing). Recommend consolidating #731 into #749.

**Group: Performance/code splitting**

- **#753** — Route-based code splitting for dashboard pages (enhancement, P2)
- **#751** — Optimize tRPC router bundle size (enhancement, P2)
- **Verdict:** Different targets (UI vs API). Not duplicates. Keep separate.

**Group: Security scanning/auditing**

- **#728** — Add security scanning workflows to CI (security, P1)
- **#786** — Stripe webhook logs partial secret (security, P1)
- **Verdict:** Different concerns (CI pipeline vs code fix). Not duplicates. Keep separate.

**Group: Testing coverage expansion**

- **#788** — UI component unit tests (test, P2)
- **#787** — DB migration tests (test, P2)
- **#754** — Webhook idempotency integration tests (test, P1)
- **#725** — API router integration tests (test, P2)
- **#724** — E2E critical flows (test, P1)
- **#729** — Bundle size regression testing (enhancement, P3)
- **Verdict:** Each targets a different layer. Not duplicates. The broader "test coverage gap" is already implicitly captured across these issues.

### Recommendation: Consolidations

1. **Consolidate #731 into #749** — #749 already covers API doc generation with AI features. Close #731 with reference to #749, transferring any unique requirements.
2. **Other issues are sufficiently distinct** — No further consolidation recommended.

---

## Action Items for Manual Execution

When `issues:write` permission is available, execute:

```bash
# P3 labels
gh issue edit 789 --add-label "P3"
gh issue edit 755 --add-label "P3,enhancement"
gh issue edit 731 --add-label "P3"
gh issue edit 729 --add-label "P3"
gh issue edit 727 --add-label "P3"
gh issue edit 726 --add-label "P3"

# P2 labels
gh issue edit 788 --add-label "P2"
gh issue edit 787 --add-label "P2"
gh issue edit 753 --add-label "P2,enhancement"
gh issue edit 752 --add-label "P2,enhancement"
gh issue edit 751 --add-label "P2,enhancement"
gh issue edit 749 --add-label "P2,enhancement"
gh issue edit 748 --add-label "P2,bug"
gh issue edit 744 --add-label "P2,bug"
gh issue edit 725 --add-label "P2"

# P1 labels
gh issue edit 786 --add-label "P1"
gh issue edit 785 --add-label "P1"
gh issue edit 754 --add-label "P1,test"
gh issue edit 728 --add-label "P1"
gh issue edit 724 --add-label "P1"

# Consolidation: Close #731 referencing #749
gh issue close 731 --comment "Consolidated into #749 which covers API doc auto-generation with broader AI-powered testing capabilities."
```

---

## REPAIR MODE Plan

Highest priority issues selected for code fix:

1. **#786 (P1, Security)** — Remove secret logging from Stripe webhook route
2. **#785 (P1, Bug)** — Remove duplicate `next` entry from packages/stripe/package.json
