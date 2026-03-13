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
npx @shahboura/agents-claude --uninstall

# Global uninstall
npx @shahboura/agents-claude --uninstall --global
```

Behavior notes:
- `--uninstall` backs up `CLAUDE.md` to `CLAUDE.<timestamp>.bk.md` and removes
  local `.claude/`.
- `--uninstall --global` renames/removes global Claude folders
  (`agents`, `skills`, `rules`, `hooks`) to timestamped backups under
  `~/.claude`, and intentionally keeps `~/.claude/settings.json`.

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
