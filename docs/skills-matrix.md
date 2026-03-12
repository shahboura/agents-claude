---
layout: default
title: Skills Matrix
nav_order: 8
description: Agent-to-skill mapping for Claude subagents with least-privilege behavior.
---

# Agent Skills Matrix

This table reflects intended skill usage for `.claude/agents/*.md`.

Quick read:
- Language-heavy agents use language/domain skills on demand.
- Docs/content/EM agents stay intentionally narrow.
- High-impact workflows are manual-invocation skills.

| Agent | Allowed skills |
|---|---|
| `codebase` | `dotnet`, `python`, `typescript`, `flutter`, `go`, `java-spring`, `node-express`, `react-next`, `ruby-rails`, `rust`, `sql-migrations` |
| `orchestrator` | `dotnet`, `python`, `typescript`, `flutter`, `go`, `java-spring`, `node-express`, `react-next`, `ruby-rails`, `rust`, `sql-migrations`, `project-bootstrap`, `docs-validation`, `agent-diagnostics`, `blogger`, `brutal-critic` |
| `planner` | `dotnet`, `python`, `typescript`, `flutter`, `go`, `java-spring`, `node-express`, `react-next`, `ruby-rails`, `rust`, `sql-migrations`, `project-bootstrap`, `docs-validation`, `agent-diagnostics` |
| `review` | `dotnet`, `python`, `typescript`, `flutter`, `go`, `java-spring`, `node-express`, `react-next`, `ruby-rails`, `rust`, `sql-migrations`, `docs-validation`, `agent-diagnostics` |
| `docs` | `docs-validation`, `project-bootstrap`, `agent-diagnostics` |
| `em-advisor` | `project-bootstrap`, `agent-diagnostics`, `docs-validation` |
| `blogger` | `blogger`, `brutal-critic` |
| `brutal-critic` | `brutal-critic`, `blogger` |

## Notes

- Skills load on demand to reduce context overhead.
- Keep skill usage narrow by role to reduce tool/context noise.
- Avoid preloading many skills in subagents unless explicitly needed.

## Skill Scope Policy (Current)

- Keep the current core-only skill set.
- Expand only when demand, gap, ownership, and licensing checks are all satisfied.

## Command Skill Routing (Pattern C)

Command skills fork context and delegate directly to a target agent.
They are invoked by the user via `/skill-name [argument]` and never load into the calling agent's context.

| Command skill | Target agent | Argument hint | Purpose |
|---|---|---|---|
| `/api-docs` | `docs` | `[module, file, or endpoint path]` | Generate API reference documentation |
| `/architecture-decision` | `docs` | `[decision topic or system name]` | Create an ADR |
| `/architecture-review` | `review` | `[system, component, or design document]` | Review design for quality attributes |
| `/code-review` | `review` | `[file, PR, or scope — blank for current changes]` | Security, performance, and style review |
| `/content-review` | `brutal-critic` | `[content text, file path, or topic]` | Score and critique content quality |
| `/create-readme` | `docs` | `[project name or path]` | Generate or improve a README |
| `/generate-tests` | `codebase` | `[file, class, or function name]` | Generate targeted tests |
| `/1-on-1-prep` | `em-advisor` | `[person] [context]` | Prepare for a focused 1-on-1 |
| `/plan-project` | `orchestrator` | `[feature, objective, or epic]` | Multi-phase implementation plan |
| `/refactor-plan` | `planner` | `[target module, file, or scope]` | Safe staged refactor strategy |
| `/security-audit` | `review` | `[scope, file, component, or 'full project']` | Security-focused code and config review |
| `/blog-post` | `blogger` | `[topic or title]` | Draft a blog post |

> **Note:** Command skills never expose themselves in the agent tool list.
> They bypass the calling agent entirely — the delegated agent receives only the skill body + `$ARGUMENTS` as its prompt.
