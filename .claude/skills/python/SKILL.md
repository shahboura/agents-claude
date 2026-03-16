---
name: python
description: Python best practices with type hints, structure, and testing conventions.
---

- Format and lint with `ruff format` + `ruff check`; type-check with `mypy --strict`.
- Run tests with `pytest`; use `pytest-cov` for coverage gates.
- Use `dataclasses`, Pydantic, or `TypedDict` for structured boundaries; avoid raw dict contracts.
- Prefer explicit type annotations on all public functions, class attributes, and fixture signatures.
- Use context managers for files/network/db resources; avoid leaked handles.
- Prefer `pathlib.Path` over `os.path` and standard import order (stdlib → third-party → local).
- Use `async/await` for I/O-bound code and ensure async calls are awaited in tests/orchestration.
- Handle errors with specific exceptions and preserve context; avoid bare `except` clauses.
