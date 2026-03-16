---
layout: default
title: Agents
nav_order: 3
has_children: false
description: Overview of the 8 built-in Claude subagents and their recommended workflow.
---
# Agents

Lean reference for the built-in Claude subagents.

## Why these agents

- **Clear separation of roles** so you can pick the right depth quickly.
- **Safer behavior by default** through least-privilege tools and settings guardrails.
- **Faster handoffs** across planning, implementation, review, and docs.

## Agent Overview

| Agent | Best For | Allocated Skills (summary) |
|-------|----------|----------------------------|
| `@orchestrator` | Multi-phase coordination | Language skills + utility skills + `blogger`/`brutal-critic` |
| `@planner` | Read-only architecture/planning | Language skills + utility skills |
| `@codebase` | Feature implementation | Language skills + `sql-migrations` |
| `@review` | Security/performance/code quality | Language skills + `docs-validation` + `agent-diagnostics` |
| `@docs` | Documentation updates | `docs-validation` + `project-bootstrap` + `agent-diagnostics` |
| `@em-advisor` | Engineering leadership guidance | `project-bootstrap` + `docs-validation` + `agent-diagnostics` |
| `@blogger` | Blog/video/podcast drafts | `blogger` + `brutal-critic` |
| `@brutal-critic` | Final content quality gate | `brutal-critic` + `blogger` |

See exact allowlists in the [Skills Matrix](../skills-matrix).

## Suggested Flow

```
@orchestrator (plan)
→ @codebase (implement)
→ @review (audit)
→ @docs (document)
```

## Agent ↔ Skill Relationship (Quick Diagram)

> Tip: if labels look small, scroll horizontally in the diagram container.

```mermaid
flowchart TD
    U["User Request in Claude"] --> O["orchestrator"]
    U --> P["planner"]
    U --> C["codebase"]
    U --> R["review"]
    U --> D["docs"]
    U --> E["em-advisor"]
    U --> B["blogger"]
    U --> X["brutal-critic"]

    subgraph Skills["Skills (.claude/skills)"]
      L1["Language Skills<br/>python/typescript/go/..."]
      L2["Utility Skills<br/>docs-validation/agent-diagnostics/project-bootstrap"]
      L3["Content Skills<br/>blogger/brutal-critic"]
      L4["Workflow Skills<br/>api-docs/code-review/..."]
    end

    O -.loads on demand.-> L1
    O -.loads on demand.-> L2
    O -.loads on demand.-> L4
    C -.loads on demand.-> L1
    C -.loads on demand.-> L4
    R -.loads on demand.-> L1
    R -.loads on demand.-> L2
    D -.loads on demand.-> L2
    B -.loads on demand.-> L3
    X -.loads on demand.-> L3
    P -.loads on demand.-> L1

    K["Dashed edge = loads skill on demand"]
    class K legend
    classDef legend fill:#1f2937,stroke:#4b5563,color:#e5e7eb
```

If Mermaid does not render in your docs host, the flow still reads top-to-bottom:

`@orchestrator/@planner/@codebase/@review/@docs/@em-advisor/@blogger/@brutal-critic` → load relevant skills on demand.

## Skill Usage Guardrails

- All built-in agents support skills.
- Skills are loaded on demand (not eagerly).
- Use one relevant skill per phase by default; add another only for clear cross-domain dependencies.
- If stack/domain is unclear, clarify before loading.

## Permission Model

- Use `.claude/settings.json` for shared permission policy.
- Use hooks for deterministic enforcement of risky operations.
- Keep agent tool lists minimal and role-specific.

## Skill Scope Policy (Current)

- Keep current **core-only** skill scope.
- Add skills only with repeat demand, clear gap, owner, and clean licensing/provenance.

## Next Steps

- **[Commands & Skills](../commands)**
- **[Coding Standards](../instructions)**
- **[Customization](../customization)**
