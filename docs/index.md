---
layout: default
title: Home
nav_order: 1
permalink: /
description: Lean Claude Code agent pack with 8 specialized subagents, on-demand skills, and secure defaults.
keywords: claude code, ai agents, subagents, skills, development workflow, code review, documentation
image: /assets/assets-og.png
twitter:
  card: summary_large_image
  image: /assets/assets-og.png
---

# Claude Agents Pack

Lean agent pack for Claude Code workflows.

## Why this pack

- **Fast setup:** install and run in minutes.
- **Clear workflow:** orchestrate → implement → review → document.
- **Safe skill model:** on-demand loading + least-privilege allowlists.
- **Release-ready defaults:** validation and CI/CD hygiene included.

Quick jump: [Agents](agents/README) · [Skills Matrix](skills-matrix) · [Commands & Skills](commands)

## Quick Start

> Install package: `@shahboura/agents-claude` · after global install, run
> `agents-claude` (unscoped `agents-claude` on npm is a different package)

`agents-claude` is for install/update/uninstall; day-to-day use runs in `claude`.

Install safety notes:
- If status shows `installed (version-marker)`, uninstall removes marker files only.
  Run `--update` first, then uninstall for full managed-file cleanup.
- If manifest trust checks fail, uninstall removes only manifest/version markers
  and skips broad file deletion for safety.
- Installer blocks writes to symlink destinations for managed files.
- Installer uses an internal managed marker so only installer-managed
  `CLAUDE.md` is eligible for removal on uninstall.

1. Install:

   ```bash
   npx @shahboura/agents-claude --global
   ```

   Installer package/command: `@shahboura/agents-claude` / `agents-claude`

2. Run:

   ```
    claude
   /init
   @orchestrator Build a user API
   ```

   Runtime command: `claude`

## Agents

| Agent | Best For | Allocated Skills (summary) |
|-------|----------|----------------------------|
| `@orchestrator` | Multi-phase coordination | Language skills + utility skills + `blogger`/`brutal-critic` |
| `@planner` | Read-only architecture/planning | Language skills + utility skills |
| `@codebase` | Feature implementation | Language skills + `sql-migrations` |
| `@review` | Security/performance/code quality | Language skills + `docs-validation` + `agent-diagnostics` |
| `@docs` | Documentation updates | `docs-validation` + `project-bootstrap` + `agent-diagnostics` |
| `@em-advisor` | EM/leadership guidance | `project-bootstrap` + `docs-validation` + `agent-diagnostics` |
| `@blogger` | Blog/video/podcast drafting | `blogger` + `brutal-critic` |
| `@brutal-critic` | Final content quality gate | `brutal-critic` + `blogger` |

For exact allowlists, use the [Skills Matrix](skills-matrix).

## Docs

- [Getting Started](getting-started)
- [Agents](agents/README)
- [Coding Standards](instructions)
- [Commands & Skills](commands)
- [Troubleshooting](troubleshooting)
- [Skills Matrix](skills-matrix)

## Skill Loading Model (Claude)

- Skills live under `.claude/skills/`.
- Claude loads skill descriptions and invokes full skill content on demand.
- Keep to one relevant skill per phase unless cross-domain work requires more.

## Skill Scope Policy (Current)

- Keep core-only scope for now.
- Add new skills only when there is clear demand, a real gap, ownership, and clean licensing.
