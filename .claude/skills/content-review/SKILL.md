---
name: content-review
description: Score and critique content quality before publishing.
argument-hint: "[content text, file path, or topic]"
disable-model-invocation: true
context: fork
agent: brutal-critic
---

Review this content: $ARGUMENTS

Return verdict, issues, scorecard, and top 3 rewrites.
