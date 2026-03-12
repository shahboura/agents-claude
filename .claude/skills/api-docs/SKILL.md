---
name: api-docs
description: Generate API documentation from existing code.
argument-hint: "[module, file, or endpoint path]"
disable-model-invocation: true
context: fork
agent: docs
---

Generate API docs for: $ARGUMENTS

Requirements:
- endpoints, request/response shapes, auth, errors
- examples and notes on edge cases
