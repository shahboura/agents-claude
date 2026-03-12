---
name: code-review
description: Comprehensive review for security, performance, and maintainability.
argument-hint: "[file, PR, or scope — leave blank for current changes]"
disable-model-invocation: true
context: fork
agent: review
---

Perform a thorough review of: $ARGUMENTS

Report:
- critical issues
- important issues
- suggestions
- positive highlights
