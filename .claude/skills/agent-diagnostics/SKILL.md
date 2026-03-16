---
name: agent-diagnostics
description: Validate agent configuration, instructions, and project setup for common issues.
disable-model-invocation: true
user-invocable: false
---

# Agent Diagnostics

Run a structured diagnostics pass for agent packs:

1. Verify agent frontmatter fields and required keys.
2. Check tool lists for least-privilege alignment.
3. Validate referenced paths/files exist.
4. Flag stale tool names or platform-incompatible fields.
5. Provide actionable fixes with file-level guidance.
