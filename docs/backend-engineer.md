# Backend Engineer - Longtime Memory

## Session: 2026-02-25

### Current State
- PR #540 (fix(api): accept undefined input in mySubscriptionSchema) - CLOSED as obsolete
  - The fix has already been merged to main
  - The schema in packages/api/src/router/auth.ts already includes `.optional()`

### Working Protocol
1. Check for open PRs with backend-engineer label first
2. If PR exists → ensure up to date with main, review, fix if necessary
3. If no PR → check for issues with backend label
4. If no issues → proactive scan for backend improvements
5. Update this memory after each session

### Notes
- Domain: Backend (API, database, authentication, validation)
- Focus: Small, safe, measurable improvements
- PR requirements: Label: backend-engineer, linked to issue, up to date with main, no conflict, build/lint/test success, ZERO warnings, small atomic diff
