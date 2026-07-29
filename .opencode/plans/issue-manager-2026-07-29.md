# Task Plan: Issue Manager - Full Lifecycle (2026-07-29)

## Goal

Normalize, deduplicate, consolidate, and resolve high-priority issues across the basefly repository.

## Phases

### Phase 0: Entry Decision

- [x] Check open PRs → None found
- [x] Check open issues → 50+ found
- [x] Enter ISSUE MANAGER MODE

### Step 1: Issue Normalization

- [ ] Fetch full details of all open issues
- [ ] Assign missing category labels (bug/enhancement/feature/docs/refactor/chore/test/ci/security)
- [ ] Assign missing priority labels (P0/P1/P2/P3)
- [ ] Standardize titles if unclear

### Step 2: Duplicate Detection

- [ ] Compare open issues by semantic similarity
- [ ] Select canonical issue for duplicates
- [ ] Close duplicates with reference to canonical
- [ ] Do NOT lose information

### Step 3: Consolidate Small Issues

- [ ] Find semantically similar small issues
- [ ] Group into meaningful combined issues
- [ ] Close sub-issues with references

### Step 4: Repair Mode

- [ ] Select highest-priority issue (P0/P1 first)
- [ ] Implement fix
- [ ] Verify (build, lint, test)
- [ ] Create PR linked to issue

## Status

**Currently in Step 1** - Gathering all issue details for normalization

## Available Labels

- Category: bug, enhancement, feature, docs, refactor, chore, test, ci, security
- Priority: P0, P1, P2, P3
- Specialist: database-architect, quality-assurance, frontend-engineer, DX-engineer, performance-engineer, Growth-Innovation-Strategist, technical-writer, platform-engineer, security-engineer, etc.
