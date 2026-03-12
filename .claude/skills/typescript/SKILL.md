---
name: typescript
description: TypeScript strict mode with type safety and modern patterns.
---

- Enable `strict: true` in `tsconfig.json`; run `tsc --noEmit` as the type-check gate.
- Lint with `eslint` using `@typescript-eslint` rules; format with `prettier`.
- Run tests with `vitest` (preferred) or `jest`; colocate test files as `*.test.ts`.
- Prefer `type` over `interface` for unions and intersections; use `interface` for extendable shapes.
- Avoid `any`; use `unknown` with narrowing, or `satisfies` for assertion-free validation.
- Use `Result`-style returns or typed errors instead of unchecked throw for domain errors.
