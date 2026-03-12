---
layout: default
title: Instructions
nav_order: 5
description: Coding standards loaded on demand through Claude skills.
---

# Coding Standards

Reference standards for each language are available as on-demand skills in `.claude/skills/`.

Agents load relevant skills on demand when work clearly matches a language/domain.
Skills are not preloaded eagerly by default.

## Skill Activation Policy (Claude)

- Load skills on demand only when the task clearly matches a domain.
- Use one relevant skill by default; load a second only for explicit cross-domain dependencies.
- If stack/domain is unclear, clarify before loading.

## Permission Policy

Use `.claude/settings.json` for shared permission rules and hook-based safety checks.
Use least-privilege tool access in `.claude/agents/*.md`.

## Coverage

| Language | Highlights |
|---------|------------|
| .NET (C#) | Clean Architecture, async/await, nullable types |
| Python | Type hints, context managers, pytest |
| TypeScript | Strict mode, null safety |
| Flutter | Riverpod, freezed models, widget testing |
| Go | Modules, context, testing |
| Java | Spring Boot DI, validation, records |
| Node.js | Security middleware, validation, structured logs |
| React | Accessibility, performance, hooks |
| Ruby | MVC, ActiveRecord, RSpec |
| Rust | Ownership, Result/Option, clippy |
| CI/CD | Fail-fast gates, security, caching |
| SQL | Safe migrations, constraints, indexes |
| Blogger | Content style, SEO, research validation |
| Brutal Critic | Framework-based scoring, review process |

## Full References

For detailed standards, open the corresponding skill under `.claude/skills/`.

## Next Steps

- **[Customization](./customization)**
- **[Agents](./agents/README)**
