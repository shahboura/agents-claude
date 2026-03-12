---
layout: default
title: Customization
nav_order: 6
description: Customize agents, commands, skills, and project context for your workflow.
---

# Customization

## Project Context

Create or update `AGENTS.md` (created on first run or via `/init`) with a short project summary:

```markdown
# Project

## Tech
- Node.js, TypeScript, PostgreSQL

## Standards
- Async/await everywhere
- Tests for new features
- No hardcoded secrets
```

## Agent Configuration

Edit `.claude/agents/[agent].md` to adjust behavior (model, tools, permission mode, memory).

## Custom Commands

Add skill files to `.claude/skills/[skill-name]/SKILL.md`.
Use `/skill-name` in Claude Code to run user-invocable skills.

## Skills

Skills live in `.claude/skills/` and are loaded on demand:

- `project-bootstrap`
- `agent-diagnostics`
- `docs-validation`

Recommended policy:

- Load skills on demand only when the task clearly matches the domain.
- Use one relevant skill by default; add a second only for explicit cross-domain work.

### Security and Permissions

Use `.claude/settings.json` for team-shared permission rules and hooks.
Prefer deny-by-default access to sensitive paths and risky commands.
Use PreToolUse hooks for deterministic command/path enforcement.

### Scope Policy (Core-only)

Current distribution is intentionally core-only; no optional skill packs are shipped.

When evaluating potential additions, use this gate:

1. Repeated demand in real usage
2. Clear capability gap vs current core
3. Named maintenance owner
4. Clean licensing/provenance (or clean-room rewrite)

## Next Steps

- **[Getting Started](./getting-started)**
- **[Agents](./agents/README)**
- **[Coding Standards](./instructions)**
