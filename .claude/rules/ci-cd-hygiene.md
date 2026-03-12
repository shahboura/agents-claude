---
paths:
  - ".github/workflows/**/*.yml"
  - ".github/workflows/**/*.yaml"
---

# CI/CD Hygiene

- Fail fast with validation gates before publish/deploy.
- Keep third-party actions pinned and current.
- Set sensible job/step timeouts.
- Use concurrency to avoid stale parallel runs.
- Avoid logging secrets; prefer secure environment variables.
- Reuse artifacts across jobs instead of rebuilding unnecessarily.
