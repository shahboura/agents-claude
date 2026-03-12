---
name: python
description: Python best practices with type hints, structure, and testing conventions.
---

- Format and lint with `ruff format` + `ruff check`; type-check with `mypy --strict`.
- Run tests with `pytest`; use `pytest-cov` for coverage gates.
- Use `dataclasses` or `pydantic` for data models; avoid raw dicts for structured data.
- Prefer explicit type annotations on all public functions and class attributes.
- Handle errors with typed exceptions; avoid bare `except` clauses.
- Structure packages with `src/` layout; keep `__init__.py` minimal.
