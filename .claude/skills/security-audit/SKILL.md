---
name: security-audit
description: Conduct a security-focused review of code and configuration.
argument-hint: "[scope, file, component, or 'full project']"
disable-model-invocation: true
user-invocable: true
---

Perform a security audit for: $ARGUMENTS

Focus on auth, input handling, secrets exposure, dependency risk, and misconfiguration.
