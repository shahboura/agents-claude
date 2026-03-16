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

- Ensure Node.js/npm are installed
- Check internet connectivity for npm/curl download
- Try `npx @shahboura/agents-claude --global` instead of curl
- Confirm you are installing the scoped package: `@shahboura/agents-claude`
- After global install, run `agents-claude` (not the package name)
- If you installed unscoped `agents-claude`, uninstall it and install the
  scoped package

### Uninstall does not seem to work

- Check active scope with `npx @shahboura/agents-claude --status`
- Default `npx @shahboura/agents-claude --uninstall` only targets the current project scope
- Use `npx @shahboura/agents-claude --uninstall --global` to remove global install
- Use `npx @shahboura/agents-claude --uninstall --all` to remove both global and project scopes
- If global is still installed, Claude Code may continue loading global agents/settings

### How do I restore from installer backups?

- Project scope backups are in `<project>/.claude/.backups/`
- Global scope backups are in `~/.claude/.backups/`
- Open the latest session folder and inspect `backup-manifest.json`
- Copy backed-up files to original paths listed in the manifest
- Retention keeps the latest 10 sessions and sessions newer than 30 days

### Existing settings changed unexpectedly

- Installer only adds missing safe defaults from package `.claude/settings.json`.
- Existing project/global settings values are preserved.
- Re-run install with `--project` or `--global` and check logs for `Updated settings safely`.

### Existing CLAUDE.md was removed unexpectedly

- Installer only removes `CLAUDE.md` when it created/managed it in manifest mode.
- If your `CLAUDE.md` existed before install, uninstall should leave it untouched.
- If removal happened in older versions, restore from backup session using `backup-manifest.json`.

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
