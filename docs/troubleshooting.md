---
layout: default
title: Troubleshooting
nav_order: 7
description: Common issues and solutions for Claude agent/skill configurations.
---

# Troubleshooting

## Common Issues

### Agents not showing up

- Verify `.claude/agents/*.md` exists
- Reload Claude Code / editor
- Check that frontmatter has `name` and `description` fields

### Agent ignores standards

- Run `/init` to create `AGENTS.md`
- Add project context to `AGENTS.md`
- Check that relevant skills exist in `.claude/skills/`

### Wrong language detected

- Add `*.sln`, `pyproject.toml`, or `tsconfig.json`
- The `@codebase` agent auto-detects based on project markers

### Tests failing after changes

- Ask the agent to fix with error output
- Include the full error message for context

### Commands not showing

- Verify skill files in `.claude/skills/*/SKILL.md`
- Reload Claude Code
- Check `SKILL.md` frontmatter (`name`, `description`)

### Installation fails

- Ensure Git and Node.js are installed
- Check internet connectivity for repository clone
- Try `npx @shahboura/agents-claude --global` instead of curl
- Confirm you are installing the scoped package: `@shahboura/agents-claude`

### Skills not loading

- Skills are available via `/skill-name` when user-invocable
- Verify skill files exist in `.claude/skills/[skill-name]/SKILL.md`
- Confirm the requested skill matches the active task domain (skills load on demand)
- If stack/domain is unclear, clarify the target language before asking for skill usage
- Note: this repository currently ships **core-only skills**; if you request a non-core skill, it will not be available.

### Permission denied

- Check `.claude/settings.json` permission deny rules
- Check PreToolUse hooks in settings
- Verify agent tool access in `.claude/agents/*.md`

### Context file too large

- Run `node scripts/check-context-size.js` to check size
- The script auto-prunes `AGENTS.md` when it exceeds 100 KB
- Keep milestone entries concise (3-5 bullets max)

### Agent permissions denied

- Check `.claude/settings.json` permission rules (`allow`, `ask`, `deny`)
- Check current mode in Claude (`/permissions`, `/config`)

## Help

- [Getting Started](./getting-started)
- [Agents](./agents/README)
- [Commands & Skills](./commands)
