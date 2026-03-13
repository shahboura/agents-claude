# Claude Agents Pack

[![Validate Agents & Documentation](https://github.com/shahboura/agents-claude/actions/workflows/validate.yml/badge.svg)](https://github.com/shahboura/agents-claude/actions/workflows/validate.yml)
[![npm version](https://img.shields.io/npm/v/%40shahboura/agents-claude)](https://www.npmjs.com/package/@shahboura/agents-claude)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://shahboura.github.io/agents-claude/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Lean Claude Code agent pack for fast setup, safer skill loading, and production-ready workflows.

## Why this pack

- **Fast onboarding:** install in minutes with `npx`.
- **Clear execution flow:** plan, implement, review, and document with purpose-built agents.
- **Safer defaults:** on-demand skills + deny-by-default skill permissions.
- **Operationally ready:** built-in validation and release automation.

Quick jump: [Agents](#agents) · [Skills Matrix](./docs/skills-matrix.md) · [Skills](#skills) · [Full Docs](https://shahboura.github.io/agents-claude/)

## Quick Start

**Requires:** Node.js and npm

```bash
# Via npx (recommended)
npx @shahboura/agents-claude --global

# Alternative (direct npm install)
npm install -g @shahboura/agents-claude && agents-claude --global

# Project install (current directory only)
npx @shahboura/agents-claude --project .

# Install with specific languages only
npx @shahboura/agents-claude --global --languages python,typescript

# Update existing installation
npx @shahboura/agents-claude --update

# Uninstall
npx @shahboura/agents-claude --uninstall

# Global uninstall
npx @shahboura/agents-claude --uninstall --global
```

Install behavior note:
- `npx`/`npm` installs from the published npm package version (deterministic release artifact).

Package naming:
- Install from `@shahboura/agents-claude` (scoped package).
- After global install, run the CLI command as `agents-claude`.
- `agents-claude` is the installer/maintenance CLI; day-to-day use runs in `claude`.
- If you see unscoped `agents-claude` on npm, treat it as a different package.

Uninstall behavior:
- `--uninstall` backs up `CLAUDE.md` to `CLAUDE.<timestamp>.bk.md` and removes
  local `.claude/`.
- `--uninstall --global` renames/removes global folders under `~/.claude`
  (`agents`, `skills`, `rules`, `hooks`) to timestamped backups and
  intentionally keeps `~/.claude/settings.json`.

First run in Claude Code:

```bash
claude
/init
@orchestrator Build a REST API with JWT auth
```

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

See full allowlists: [Skills Matrix](./docs/skills-matrix.md)

## Skill Loading (Claude)

- Skills live in `.claude/skills/<name>/SKILL.md`.
- Skills are loaded on demand via Claude Code skills.
- Use one relevant skill per task/phase by default; add another only for clear cross-domain work.
- If stack/domain is unclear, ask for clarification before loading.

## Skill Scope Policy (Keep it)

- **Yes, keep this policy.** It keeps the pack focused and safe.
- Current scope is **core-only** skills (no optional skill packs).
- Additions should pass demand, clear-gap, ownership, and licensing/provenance checks.

## Skill Permissions (Least Privilege)

Use least-privilege tools and selective skill invocation to prevent unrelated context/tool access.

This keeps skills focused by task and reduces accidental context bloat.

## Skills

Type `/skill-name` in Claude Code to run:

| Skill | Description |
|---------|-------------|
| `/api-docs` | Generate API documentation |
| `/code-review` | Comprehensive code review |
| `/generate-tests` | Unit test generation |
| `/security-audit` | Security audit |
| `/refactor-plan` | Refactoring plan |
| `/create-readme` | Generate README |
| `/architecture-decision` | ADR creation |
| `/architecture-review` | Architecture review |
| `/blog-post` | Blog post creation |
| `/content-review` | Content quality scoring |
| `/plan-project` | Multi-phase project planning |
| `/1-on-1-prep` | Meeting preparation |

## Docs

- **[Getting Started](./docs/getting-started.md)**
- **[Full Documentation](https://shahboura.github.io/agents-claude/)**
