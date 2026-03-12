---
name: generate-tests
description: Generate targeted tests for uncovered or risky behavior.
argument-hint: "[file, class, or function name]"
disable-model-invocation: true
context: fork
agent: codebase
---

Generate tests for: $ARGUMENTS

Include edge cases, failure paths, and clear assertions.
