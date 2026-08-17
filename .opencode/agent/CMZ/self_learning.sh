#!/bin/bash
# CMZ Agent - Self-Learning Loop
# Periodically scans .opencode/skills, downloads or registers new skills, and parses SKILL.md documentation to ingest new capabilities.

echo "📚 [CMZ Self-Learning] Initializing skill ingest cycle..."

SKILLS_DIR=".opencode/skills"
MEMORY_FILE=".opencode/agent/CMZ/memory.log"

if [ ! -d "$SKILLS_DIR" ]; then
  echo "⚠️ [CMZ Self-Learning] Skills directory not found. Skipping ingest."
  exit 0
fi

echo "--- Self-Learning Cycle Run: $(date) ---" >> "$MEMORY_FILE"

# Scan each skill directory under .opencode/skills/
for skill_path in "$SKILLS_DIR"/*; do
  if [ -d "$skill_path" ]; then
    skill_name=$(basename "$skill_path")
    echo "🔍 [CMZ Self-Learning] Auditing skill: $skill_name"

    # Read SKILL.md if present
    if [ -f "$skill_path/SKILL.md" ]; then
      skill_desc=$(cat "$skill_path/SKILL.md" | head -n 1)
      echo "✅ [CMZ Self-Learning] Ingested skill capability: '$skill_desc'"
      echo "Ingested: $skill_name - $skill_desc" >> "$MEMORY_FILE"
    else
      echo "ℹ️ [CMZ Self-Learning] No description found for $skill_name"
    fi
  fi
done

echo "✅ [CMZ Self-Learning] Ingestion cycle complete. Memory updated successfully!"
exit 0
