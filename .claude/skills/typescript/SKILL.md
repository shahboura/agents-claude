---
name: typescript
description: TypeScript strict mode with type safety and modern patterns.
---

- Enforce `strict: true` and `noUncheckedIndexedAccess`; run `tsc --noEmit` as a required gate.
- Keep linting with `eslint` + `@typescript-eslint`; format with project formatter policy.
- Prefer `unknown` + narrowing and `satisfies` over `any` and assertion-heavy casts.
- Model domain boundaries with discriminated unions and exhaustive `switch` handling.
- Prefer explicit return types on exported APIs and shared utilities.
- Validate external inputs at runtime (e.g., zod/io-ts) before trusting compile-time types.
- Keep test coverage on critical logic with `vitest`/`jest` and typed fixtures.
- Avoid throwing untyped domain errors; use typed error objects or `Result`-style returns.
