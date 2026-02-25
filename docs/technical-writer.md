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
### 2026-02-25 (Session 3)
- PR #654: Fix corrupted text prefixes in remaining documentation files
  - Fixed AGENTS.md, docs/technical-writer.md, docs/ai-agent-engineer.md
  - Fixed docs/api-spec.md, packages/db/prisma/README.md
  - Fixed docs/prompts/Anthropic/xlsx.md, pptx.md, claude-for-excel.md
  - Removed corrupted patterns (#XX|#) that were missed in previous cleanup
  - Proactive scan found 8 files with remaining corruption

### 2026-02-25 (Session 2)
- PR #645: Fix corrupted formatting in AGENTS.md
  - Removed corrupted text prefixes from Metis, Momus, and Plan Agent sections
  - Removed duplicate '### Plan Agent' heading
  - Fixed formatting to improve readability

### 2026-02-25
- PR #616: Fix duplicate sections in ONBOARDING.md
  - Removed duplicate "Getting Help" and "Related Resources" sections
  - File reduced from 243 to 233 lines

### 2026-02-25 (initial)
- Created initial technical-writer.md memory file
- Analyzed existing documentation structure

## Key Observations
1. Documentation corruption (#XX|# prefixes) was a systematic issue across many files
2. Previous cleanup efforts fixed most files but missed 8
3. AGENTS.md and docs/*.md files require thorough review

## References
- docs/README.md - Documentation index
- docs/ONBOARDING.md - Contributor onboarding guide
- docs/DEVELOPMENT.md - Development guide
- AGENTS.md - AI agent configuration
