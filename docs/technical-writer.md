# Technical Writer - Long-term Memory

## Domain
Technical Writer - Documentation, content quality, developer experience

## Objective
Deliver small, safe, measurable improvements strictly inside the documentation domain.

## Scope
- Documentation accuracy and completeness
- Developer onboarding content
- API documentation
- README files and guides
- Style consistency across documentation
- Contributing guidelines

## Execution Mode
1. If open PR with label `technical-writer` exists → ensure up to date with default branch, review, fix if necessary and comment on that PR. Skip other job.
2. If Issue exists → execute → create/update PR.
3. If none → proactive scan limited to domain → create/update PR.
4. If nothing valuable → proactive scan repository health and efficiency limited to domain → create/update PR if needed.

## PR Requirements
- Label: `technical-writer`
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## History

### 2026-02-27 (Session 3)
- PR #732: Fix corrupted text formatting in README.md
  - Removed corrupted text prefixes (`#XX|` patterns) from all 318 lines
  - Removed duplicate entries for trpc and tanstack/react-query
  - File reduced from 318 to 317 lines
  - Fixed issue #697

### 2026-02-25 (Session 2)
- PR #645: Fix corrupted formatting in AGENTS.md
  - Removed corrupted text prefixes (`#QM|`, `#BM|`, `#TH|`, etc.) from Metis, Momus, and Plan Agent sections
  - Removed duplicate '### Plan Agent' heading
  - Fixed formatting to improve readability
  - Proactive scan found issues during AGENTS.md review

### 2026-02-25 (continued)
- PR #616: Fix duplicate sections in ONBOARDING.md
  - Removed duplicate "Getting Help" and "Related Resources" sections
  - File reduced from 243 to 233 lines
  - Proactive scan found issue during documentation review

### 2026-02-25
- Created initial technical-writer.md memory file
- Analyzed existing documentation structure:
  - docs/README.md - Main documentation index
  - docs/ONBOARDING.md - Contributor onboarding (already exists)
  - docs/DEVELOPMENT.md - Development quick start
  - docs/api-spec.md - API specification (986 lines)
  - docs/blueprint.md - Database architecture
  - Other agent memories: ai-agent-engineer.md, platform-engineer.md, security-engineer.md

### Key Observations
1. ONBOARDING.md already exists but could be enhanced
2. AGENTS.md in root contains detailed AI agent configuration
3. Multiple language READMEs exist (Chinese, German, Vietnamese)
4. Documentation follows consistent style with markdown tables
5. Several files have corrupted text prefixes that need cleaning

### Potential Improvements
- [ ] Fix corrupted text in docs/technical-writer.md (this file!)
- [ ] Fix corrupted text in other documentation files
- [ ] Enhance ONBOARDING.md with AI agent workflow patterns from AGENTS.md
- [ ] Add documentation for new AI agent categories and skills
- [ ] Review and update any outdated documentation

## Active Issues (Technical-Writer Label)
- #707: README.md claims Zustand is used but it's not in the codebase
  - Note: Investigation showed Zustand IS actually used in use-signin-modal.ts (with corrupted text)
  - The README no longer mentions Zustand after corruption fix
- #697: Fix corrupted text formatting in documentation files
  - Fixed: README.md cleaned (PR #732)

## References
- docs/README.md - Documentation index
- docs/ONBOARDING.md - Contributor onboarding guide
- docs/DEVELOPMENT.md - Development guide
- AGENTS.md - AI agent configuration
