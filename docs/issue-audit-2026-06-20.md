# Issue Audit - 2026-06-20

## Phase 0 Entry Decision
- **Open PRs**: 0
- **Open Issues**: 88
- **Decision**: Issue Manager Mode

---

## Step 1 — Issue Normalization Analysis

### Priority Labels Needed (37 issues missing P0-P3)

The following issues have no priority label and should have one added:

| Issue | Current Label(s) | Recommended Priority |
|-------|-----------------|-------------------|
| #789 | enhancement | P3 |
| #788 | test | P2 |
| #787 | test | P2 |
| #786 | security | P1 |
| #785 | bug | P2 |
| #755 | database-architect | P2 |
| #754 | quality-assurance | P2 |
| #753 | frontend-engineer | P2 |
| #752 | DX-engineer | P2 |
| #751 | performance-engineer | P2 |
| #749 | Growth-Innovation-Strategist | P3 |
| #748 | DX-engineer | P2 |
| #744 | Growth-Innovation-Strategist | P2 |
| #731 | enhancement | P3 |
| #729 | enhancement | P2 |
| #728 | security | P1 |
| #727 | enhancement | P3 |
| #726 | ci | P2 |
| #725 | test | P2 |
| #724 | test | P2 |
| #723 | enhancement | P2 |
| #722 | security | P1 |
| #721 | security | P1 |
| #720 | enhancement | P3 |
| #719 | enhancement | P2 |
| #713 | enhancement/test | P2 |
| #697 | technical-writer | P2 |
| #668 | enhancement | P3 |
| #636 | enhancement | P3 |
| #635 | documentation | P3 |
| #634 | enhancement | P2 |
| #632 | security | P1 |
| #631 | enhancement | P2 |
| #630 | enhancement | P2 |
| #628 | enhancement | P2 |
| #595 | platform-engineer | P2 |
| #584 | enhancement, ci | P2 |
| #305 | enhancement, ci | P2 |

### Standard Category Labels Needed (12 issues missing standard category)

| Issue | Current Labels | Recommended Category |
|-------|---------------|-------------------|
| #755 | database-architect | enhancement |
| #754 | quality-assurance | test |
| #753 | frontend-engineer | enhancement |
| #752 | DX-engineer | enhancement |
| #751 | performance-engineer | enhancement |
| #749 | Growth-Innovation-Strategist | enhancement |
| #748 | DX-engineer | enhancement |
| #744 | Growth-Innovation-Strategist | ci |
| #697 | technical-writer | docs |
| #670 | P3, DX-engineer | enhancement |
| #635 | documentation | docs |
| #595 | platform-engineer | ci |

---

## Step 2 — Duplicate Detection

### Confirmed Duplicates

1. **Rate Limiter Duplicate**: #496 (P0) and #480 (P1)
   - Both: "Replace in-memory rate limiter with Redis-based solution"
   - Keep: #496 (more detailed, higher priority)
   - Close: #480

2. **pnpm Consistency Duplicates**: #305, #584, #595, #670, #744
   - All target the same issue: GitHub Actions workflows using npm instead of pnpm
   - Keep: #305 (canonical, oldest)
   - Consolidate: #584, #595, #670, #744 into #305

3. **.nvmrc Duplicates**: #720 and #748
   - Both target the .nvmrc file
   - Already fixed (file now contains `22.14.0`)
   - Keep: #748
   - Close: #720

### Already Resolved (Fix Applied, Issue Not Closed)

| Issue | Description | Evidence |
|-------|-------------|----------|
| #748 | .nvmrc invalid value | File contains `22.14.0` |
| #720 | Missing .nvmrc (dup of #748) | Fixed alongside #748 |
| #785 | Duplicate next dependency | packages/stripe/package.json has no duplicate |
| #786 | Stripe webhook logs partial secret | No secret logging in webhook route |
| #722 | Environment validation at startup | `validateEnvVars()` and `initEnvValidation()` implemented |
| #664 | console.* in packages/db and packages/stripe | All console.* in production code replaced with pino |

---

## Step 3 — Consolidation Opportunities

### Testing Issues (7+ issues, can be grouped)
- #581, #549, #550, #551, #725, #724, #501, #500, #631, #628, #788, #787, #713
- Suggestion: Create meta-issue "# [Testing] Comprehensive Test Infrastructure" and close individual ones as sub-tasks

### CI/CD Issues (5 issues)
- #613, #584, #595, #670, #744, #305, #726, #502, #522
- Overlapping: pnpm consistency, workflow standardization
- Can be consolidated into #305 (pnpm) and #613 (CI cleanup) meta-issues

---

## Step 4 — Repair Mode

### Selected Issue: #611 - Add not-found.tsx for route groups (P3, DX)

**Route groups missing not-found.tsx** (4 total):
- ✅ (auth) - Created
- ✅ (dashboard) - Created
- ✅ (docs) - Created
- ✅ (editor) - Created
- ✅ (marketing) - Already existed

**Template used**: Same pattern as `(marketing)/not-found.tsx` with route-group-specific navigation links.

**Verification Results**:
- Lint: 8/8 passed
- Typecheck: 8/8 passed
- Tests: 64 files, 1371 tests passed
- Build: Blocked by Node.js version mismatch (Node 20 in CI, requires >=22)

---

## Codebase Health Summary

| Metric | Status |
|--------|--------|
| Lint | ✅ 8/8 packages |
| Typecheck | ✅ 8/8 packages |
| Tests | ✅ 64 files, 1371 tests |
| Build | ❌ Next.js build fails (Node.js 20, needs ≥22) |

### Build Failure Analysis
The Next.js build (`@saasfly/nextjs#build`) fails with:
```
TypeError: webidl.util.markAsUncloneable is not a function
```
This is a **Node.js version compatibility issue** — the project requires Node.js ≥22 (as specified in `.nvmrc` and `package.json`), but the CI environment runs Node.js 20.20.2. The fix is to upgrade the CI Node.js version, already addressed by issue #873 ([DX] Update devcontainer to Node.js 22).
