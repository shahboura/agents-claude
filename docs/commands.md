---
layout: default
title: Commands & Skills
nav_order: 4
description: Slash-invoked skills and reusable workflows for Claude Code.
---

# Commands & Skills

## Commands

Type `/skill-name` in Claude Code to run.

Most commands accept an optional argument to scope the task:
`/skill-name [argument]` — the argument is passed directly to the target agent.

| Command | Argument hint | Purpose |
|---|---|---|
| `/api-docs` | `[module, file, or endpoint path]` | Generate API reference docs |
| `/architecture-decision` | `[decision topic or system name]` | Create an ADR |
| `/architecture-review` | `[system, component, or design document]` | Review design for quality attributes |
| `/blog-post` | `[topic or title]` | Write a blog post |
| `/code-review` | `[file, PR, or scope — blank for current changes]` | Security, perf, and style review |
| `/content-review` | `[content text, file path, or topic]` | Score and critique content quality |
| `/create-readme` | `[project name or path]` | Generate or improve a README |
| `/generate-tests` | `[file, class, or function name]` | Generate targeted tests |
| `/plan-project` | `[feature, objective, or epic]` | Multi-phase implementation plan |
| `/refactor-plan` | `[target module, file, or scope]` | Safe staged refactor strategy |
| `/security-audit` | `[scope, file, component, or 'full project']` | Security-focused code review |
| `/1-on-1-prep` | `[person] [context]` | Prepare for a 1-on-1 meeting |

## Skills

Skills are reusable behaviors loaded on demand:

- `project-bootstrap` - Create a minimal `AGENTS.md` scaffold
- `agent-diagnostics` - Validate agent setup and instruction coverage
- `docs-validation` - Outline docs lint and link checks

### Using Skills

Skills are defined in `.claude/skills/[skill-name]/SKILL.md`.
Claude can invoke model-invocable skills automatically when relevant.
You can always invoke user-invocable skills manually with `/skill-name`.

```
/project-bootstrap
/agent-diagnostics
```

For high-impact workflows, set `disable-model-invocation: true` to require manual invocation.

### Skill Selection Guardrails

- Load skills on demand for matching tasks only.
- Use one relevant skill by default; add a second only for clear cross-domain need.
- If technology/domain is ambiguous, ask for clarification before loading.

### Security Hardening

- Keep sensitive path denies in `.claude/settings.json`.
- Use PreToolUse hooks for command/path guardrails.
- Keep skill descriptions concise to minimize context overhead.

## Custom Skills

Add a directory under `.claude/skills/<name>/` containing `SKILL.md`.
Use frontmatter like:

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
---
```

See [Claude Skills docs](https://code.claude.com/docs/en/skills) for full reference.

## Next Steps

- **[Agents](./agents/README)**
- **[Customization](./customization)**
