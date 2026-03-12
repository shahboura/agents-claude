---
name: node-express
description: Node.js + Express best practices for services and APIs.
---

- Lint with `eslint` (+ `@typescript-eslint` if using TypeScript); format with `prettier`; run checks in CI.
- Run tests with `vitest` or `jest`; use `supertest` for HTTP integration tests; mock at the boundary layer.
- Always use `async`/`await` in route handlers and middleware; propagate errors via `next(err)` — never swallow or `process.exit`.
- Validate and parse all inputs at the boundary with `zod` or `joi`; reject unknown fields with `.strict()`.
- Apply `helmet` for security headers, `express-rate-limit` for rate limiting, and `cors` with an explicit allow-list — not `{ origin: '*' }` in production.
- Structure by domain: `src/<domain>/{router,service,repository}.ts`; keep route handlers as thin orchestrators.
