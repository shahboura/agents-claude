---
layout: default
title: Getting Started
nav_order: 2
description: Install and configure Claude-targeted agents in under 5 minutes with npx or curl.
---

# Getting Started

Get up and running with Claude-targeted agents in under 5 minutes.

## Prerequisites

- [Claude Code](https://code.claude.com/docs/en/overview) installed
- Node.js/npm
- Any project (existing repos work perfectly)

## Quick Setup (60 seconds)

> **Package naming:** install from `@shahboura/agents-claude`; after global install,
> run the CLI command as `agents-claude`. If you find unscoped `agents-claude`
> on npm, treat it as a different package.

`agents-claude` is the installer/maintenance CLI. Your normal workflow runs in
`claude`.

### Via npx (Recommended)

```bash
# Global install
npx @shahboura/agents-claude --global

# Project install
npx @shahboura/agents-claude --project .

# Install with specific languages only
npx @shahboura/agents-claude --global --languages python,typescript

# Update existing installation
npx @shahboura/agents-claude --update

# Force update both global + current project scopes
npx @shahboura/agents-claude --update --all
```

### Via curl

#### Global Installation

```bash
curl -fsSL https://raw.githubusercontent.com/shahboura/agents-claude/main/install.js \
  -o install.js && node install.js --global && rm install.js
```

#### Project Installation

```bash
curl -fsSL https://raw.githubusercontent.com/shahboura/agents-claude/main/install.js \
  -o install.js && node install.js --project /path/to/your/project && rm install.js
```

#### Windows (PowerShell)

```powershell
curl -fsSL https://raw.githubusercontent.com/shahboura/agents-claude/main/install.js `
  -o install.js; node install.js --global; rm install.js
```

### Uninstall

```bash
# Current project scope (default)
npx @shahboura/agents-claude --uninstall

# Global uninstall
npx @shahboura/agents-claude --uninstall --global

# Uninstall both global + current project scopes
npx @shahboura/agents-claude --uninstall --all

# Check detected install scopes
npx @shahboura/agents-claude --status
```

- Default uninstall applies to the **current project scope**.
- Use `--global` or `--all` to target non-project scope.
- Removes installer-managed files using install manifest tracking.
- If status shows `installed (version-marker)`, uninstall removes marker files only.
  Run `--update` first, then uninstall for full managed-file cleanup.
- If manifest trust checks fail, uninstall removes only manifest/version markers
  and skips broad file deletion for safety.
- Project backups: `<project>/.claude/.backups/<timestamp>--<operation>--<scope>/`
- Global backups: `~/.claude/.backups/<timestamp>--<operation>--<scope>/`
- Backup retention: latest 10 sessions and sessions newer than 30 days.
- Installer only merges missing safe defaults into existing `.claude/settings.json`.
- Existing permissions/sandbox/hooks remain unchanged.
- If `CLAUDE.md` already exists before install, installer leaves it unmanaged and does not remove it on uninstall.
- Installer uses an internal managed marker so only installer-managed `CLAUDE.md`
  is eligible for removal on uninstall.
- Installer blocks writes to symlink destinations for managed files.

Scope matrix:
- `--global` → global scope only (`~/.claude`)
- `--project [dir]` → project scope only (`<project>/.claude` + installer-managed `CLAUDE.md`)
- `--update` → auto-detects and updates installed scopes
- `--uninstall` → current project scope by default
- `--all` → both global and current project scopes

To restore files, use `backup-manifest.json` from a backup session and copy files back to original paths.

## Your First Run

1. Open Claude Code:

   ```bash
   claude
   ```

2. Initialize context:

   ```
   /init
   ```

3. Ask for help:

   ```
   @orchestrator Build a user authentication API with JWT tokens
   ```

## What gets installed

- `.claude/` agents, skills, settings, hooks, and rules
- `CLAUDE.md` project instructions file

## Notes

- `AGENTS.md` is created on first run or via `/init`.
- Skills in `.claude/skills/` are loaded on demand.
- Keep `CLAUDE.md` concise and move heavy guidance into skills/rules.

## Next Steps

- **[Agents](./agents/README)**
- **[Coding Standards](./instructions)**
- **[Commands & Skills](./commands)**
- **[Troubleshooting](./troubleshooting)**
