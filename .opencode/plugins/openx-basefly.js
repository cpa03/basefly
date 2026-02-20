/**
 * OpenX Basefly Plugin for OpenCode.ai
 *
 * Integrates superpowers and custom skills framework
 * Provides multi-model orchestration with free tier models
 */

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple frontmatter extraction
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line
        .slice(colonIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// Normalize a path
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== "string") return null;
  let normalized = p.trim();
  if (!normalized) return null;
  if (normalized.startsWith("~/")) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === "~") {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

export const OpenXBaseflyPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  const superpowersSkillsDir = path.resolve(__dirname, "superpowers");
  const customSkillsDir = path.resolve(__dirname, "skills");
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || path.join(homeDir, ".config/opencode");

  // Helper to generate bootstrap content
  const getBootstrapContent = () => {
    // Try to load using-superpowers skill
    const skillPath = path.join(
      superpowersSkillsDir,
      "using-superpowers",
      "SKILL.md",
    );
    if (!fs.existsSync(skillPath)) return null;

    const fullContent = fs.readFileSync(skillPath, "utf8");
    const { content } = extractAndStripFrontmatter(fullContent);

    const toolMapping = `**Tool Mapping for OpenX Basefly:**
When skills reference tools you don't have, substitute OpenCode equivalents:
- \`TodoWrite\` → \`update_plan\`
- \`Task\` tool with subagents → Use OpenCode's subagent system (@mention)
- \`Skill\` tool → OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` → Your native tools

**Skills location:**
- Superpowers skills: \`${configDir}/skills/superpowers/\`
- Custom skills: \`${configDir}/skills/\`
Use OpenCode's native \`skill\` tool to list and load skills.

**OpenX Basefly Configuration:**
This project uses free tier models:
- Sisyphus (Main): opencode/kimi-k2.5-free
- Oracle: opencode/glm-4.7-free
- Librarian: opencode/glm-4.7-free
- Explore: opencode/gpt-5-nano
- Multimodal Looker: opencode/minimax-m2.1-free

Type 'ultrawork' or 'ulw' to activate full agent harness.`;

    return `<EXTREMELY_IMPORTANT>
You have superpowers via OpenX Basefly.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
  };

  return {
    // Use system prompt transform to inject bootstrap
    "experimental.chat.system.transform": async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (bootstrap) {
        (output.system ||= []).push(bootstrap);
      }
    },
  };
};
