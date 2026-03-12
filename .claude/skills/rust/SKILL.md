---
name: rust
description: Rust best practices with ownership, error handling, and performance.
---

- Lint with `cargo clippy -- -D warnings`; format with `cargo fmt`; check with `cargo check`.
- Run tests with `cargo test`; use `#[cfg(test)]` modules for unit tests, `tests/` for integration.
- Use `Result<T, E>` and `Option<T>` consistently; avoid `.unwrap()` outside tests.
- Define domain errors with `thiserror`; propagate with `?`; wrap external errors.
- Prefer owned types in public APIs; use lifetimes only when shared references give clear benefit.
- Use `derive` macros (`Debug`, `Clone`, `PartialEq`) liberally; avoid manual impls unless needed.
