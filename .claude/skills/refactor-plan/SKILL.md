---
name: refactor-plan
description: Produce a safe refactor strategy with staged rollout.
argument-hint: "[target module, file, or scope]"
disable-model-invocation: true
user-invocable: true
---

Create a refactor plan for: $ARGUMENTS

Output must include:
- **Staged steps** — ordered phases with clear entry/exit criteria per stage
- **Test coverage gate** — minimum tests required *before* starting (characterization/regression tests) and what new tests are needed *after*
- **Rollback strategy** — per-stage revert instructions; flag if any stage is irreversible and requires a feature flag or migration
- **Risk assessment** — which stage carries the highest breakage risk and why
