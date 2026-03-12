# Agents-Claude Repository

This repository migrates and maintains an agent pack tailored for **Claude Code**.

## Core Objectives

- Keep agent behavior secure by default (least privilege)
- Keep context footprint small (on-demand loading)
- Keep workflows reusable (skills + subagents)
- Keep documentation and validations accurate and current

## Working Conventions

- Prefer **Plan Mode** for broad/unclear changes.
- For implementation tasks, work in small verifiable increments.
- Run project validation before finalizing substantial changes.
- Do not add broad always-on instructions when a skill/rule can scope it better.

## Skill and Context Policy

- Skills are loaded on demand.
- Use one relevant skill per task by default.
- Add a second skill only for explicit cross-domain needs.
- Keep this file concise; put detailed guidance in skills or `.claude/rules/`.

## Safety Requirements

- Never expose secrets in outputs, docs, or examples.
- Respect deny-listed files and directories in `.claude/settings.json`.
- Treat potentially destructive Bash commands as blocked unless clearly required.
- Prefer deterministic hook enforcement over prompt-only safety instructions.

## Validation Expectations

- Documentation updates should pass markdown and link checks.
- Agent/skill changes should pass schema/structure checks.
- Keep references aligned with current docs at `https://code.claude.com/docs/en/`.

## Repository Memory

- `AGENTS.md` stores concise milestone history for significant changes.
- Keep entries short and practical (what changed, why, and key outcomes).
