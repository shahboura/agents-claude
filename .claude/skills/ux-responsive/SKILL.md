---
name: ux-responsive
description: Responsive UX guidance for phone/tablet/desktop layouts, interaction modes, and accessibility across breakpoints.
---

- Define and document breakpoint strategy before implementation (`sm`, `md`, `lg`, `xl`) and avoid ad-hoc breakpoints.
- Prefer fluid layouts with resilient containers (`minmax`, flex wrap, content reflow) over device-specific hardcoding.
- Validate keyboard, touch, and pointer interactions on all critical flows; never rely on hover-only affordances.
- Keep tap targets accessible (`>=44px`) and preserve readable typography/spacing under zoom and reduced viewport widths.
- Test responsive behavior with orientation changes, dynamic content length, and localization expansion.
- Include accessibility checks per breakpoint (focus order, landmarks, contrast, reduced motion compatibility).
