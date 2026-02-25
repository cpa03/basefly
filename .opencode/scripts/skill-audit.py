#!/usr/bin/env python3
"""
skill-audit.py - Validate SKILL.md files for required sections and consistency.

This utility audits all SKILL.md files in the .opencode directory structure
to ensure they follow the standardized skill template with required sections:
- YAML frontmatter with name and description
- Context section
- Goals section  
- Instructions section

Usage:
    python skill-audit.py [--fix-report] [path]

Exit codes:
    0 - All skills pass validation
    1 - One or more skills have issues
"""

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class SkillAuditResult:
    """Result of auditing a single SKILL.md file."""
    path: Path
    has_frontmatter: bool = False
    has_name: bool = False
    has_description: bool = False
    has_context: bool = False
    has_goals: bool = False
    has_instructions: bool = False
    issues: list[str] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return len(self.issues) == 0

    @property
    def score(self) -> int:
        """Return number of required sections present (0-6)."""
        checks = [
            self.has_frontmatter,
            self.has_name,
            self.has_description,
            self.has_context,
            self.has_goals,
            self.has_instructions,
        ]
        return sum(checks)


def extract_frontmatter(content: str) -> tuple[Optional[str], str]:
    """Extract YAML frontmatter from markdown content.
    
    Returns:
        Tuple of (frontmatter_content, body_content) or (None, content) if no frontmatter.
    """
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, content, re.DOTALL)
    if match:
        return match.group(1), match.group(2)
    return None, content


def check_frontmatter_field(frontmatter: Optional[str], field_name: str) -> bool:
    """Check if a field exists in YAML frontmatter."""
    if not frontmatter:
        return False
    # Match both 'name: value' and 'name: "value"' patterns
    pattern = rf'^{field_name}\s*:\s*.+$'
    return bool(re.search(pattern, frontmatter, re.MULTILINE))


def check_section(body: str, section_name: str) -> bool:
    """Check if a section exists in markdown body.
    
    Matches headers like '## Context', '## Goals', '## Instructions'
    (case-insensitive, supports various header levels).
    """
    pattern = rf'^#+\s*{section_name}\s*$'
    return bool(re.search(pattern, body, re.MULTILINE | re.IGNORECASE))


def audit_skill_file(file_path: Path) -> SkillAuditResult:
    """Audit a single SKILL.md file for required sections."""
    result = SkillAuditResult(path=file_path)
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        result.issues.append(f"Failed to read file: {e}")
        return result
    
    # Extract frontmatter
    frontmatter, body = extract_frontmatter(content)
    
    # Check frontmatter
    result.has_frontmatter = frontmatter is not None
    if not result.has_frontmatter:
        result.issues.append("Missing YAML frontmatter (--- delimited block)")
    else:
        result.has_name = check_frontmatter_field(frontmatter, 'name')
        if not result.has_name:
            result.issues.append("Missing 'name' field in frontmatter")
        
        result.has_description = check_frontmatter_field(frontmatter, 'description')
        if not result.has_description:
            result.issues.append("Missing 'description' field in frontmatter")
    
    # Check body sections
    result.has_context = check_section(body, 'Context')
    if not result.has_context:
        result.issues.append("Missing '## Context' section")
    
    result.has_goals = check_section(body, 'Goals')
    if not result.has_goals:
        result.issues.append("Missing '## Goals' section")
    
    result.has_instructions = check_section(body, 'Instructions')
    if not result.has_instructions:
        result.issues.append("Missing '## Instructions' section")
    
    return result


def find_skill_files(base_path: Path) -> list[Path]:
    """Find all SKILL.md files in the given path."""
    patterns = [
        "skills/**/SKILL.md",
        "superpowers/**/SKILL.md",
    ]
    
    files = []
    for pattern in patterns:
        files.extend(base_path.glob(pattern))
    
    return sorted(set(files))


def format_result(result: SkillAuditResult, verbose: bool = False) -> str:
    """Format a single audit result for display."""
    status = "✓ PASS" if result.is_valid else "✗ FAIL"
    relative_path = result.path.relative_to(Path.cwd()) if result.path.is_relative_to(Path.cwd()) else result.path
    
    lines = [f"\n{status} [{result.score}/6] {relative_path}"]
    
    if verbose or not result.is_valid:
        for issue in result.issues:
            lines.append(f"  - {issue}")
    
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate SKILL.md files for required sections",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Required sections for valid SKILL.md:
  1. YAML frontmatter with 'name' field
  2. YAML frontmatter with 'description' field
  3. ## Context section
  4. ## Goals section
  5. ## Instructions section

Examples:
  skill-audit.py                          # Audit all skills in .opencode/
  skill-audit.py --verbose                # Show detailed output
  skill-audit.py .opencode/skills/ai-agent-engineer/SKILL.md  # Audit single file
        """
    )
    parser.add_argument(
        "path",
        nargs="?",
        default=".opencode",
        help="Path to audit (default: .opencode)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Show detailed output for all skills"
    )
    parser.add_argument(
        "--fix-report",
        action="store_true",
        help="Output a markdown report with suggested fixes"
    )
    
    args = parser.parse_args()
    base_path = Path(args.path).resolve()
    
    if not base_path.exists():
        print(f"Error: Path does not exist: {base_path}", file=sys.stderr)
        return 1
    
    # Find SKILL.md files
    if base_path.is_file() and base_path.name == "SKILL.md":
        skill_files = [base_path]
    else:
        skill_files = find_skill_files(base_path)
    
    if not skill_files:
        print(f"No SKILL.md files found in {base_path}", file=sys.stderr)
        return 1
    
    # Audit all files
    results = [audit_skill_file(f) for f in skill_files]
    
    # Print results
    print("=" * 60)
    print("SKILL.md AUDIT REPORT")
    print("=" * 60)
    
    for result in results:
        print(format_result(result, verbose=args.verbose))
    
    # Summary
    total = len(results)
    passed = sum(1 for r in results if r.is_valid)
    failed = total - passed
    avg_score = sum(r.score for r in results) / total if total > 0 else 0
    
    print("\n" + "=" * 60)
    print(f"SUMMARY: {passed}/{total} skills passed, avg score: {avg_score:.1f}/6")
    print("=" * 60)
    
    if args.fix_report and failed > 0:
        print("\n## Suggested Fixes\n")
        for result in results:
            if not result.is_valid:
                rel_path = result.path.relative_to(base_path) if result.path.is_relative_to(base_path) else result.path
                print(f"### {rel_path}\n")
                for issue in result.issues:
                    print(f"- {issue}")
                print()
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
