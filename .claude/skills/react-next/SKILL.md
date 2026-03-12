---
name: react-next
description: React and Next.js frontend best practices with TypeScript and accessibility.
---

- Lint with `eslint` (next/core-web-vitals config); type-check with `tsc --noEmit`; format with `prettier`.
- Run tests with `vitest` + `@testing-library/react`; test behavior, not implementation details.
- Default to Server Components; add `"use client"` only when browser APIs or interactivity are required.
- Colocate components, hooks, and tests; use `app/` directory with route-level layouts and loading states.
- Fetch data in Server Components or Route Handlers; avoid client-side data fetching for initial loads.
- Ensure WCAG 2.1 AA compliance: semantic HTML, ARIA labels on interactive elements, keyboard navigation.
