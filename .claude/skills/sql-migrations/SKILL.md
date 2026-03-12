---
name: sql-migrations
description: SQL and database migration best practices for safe schema changes.
---

- Every migration must have an `up` (or `change`) and a `down`; verify `down` manually before merging.
- Never modify or delete an existing migration file once it has been applied to any shared environment — always add a new migration.
- Add columns as `NULL`-able first; back-fill data in a separate migration; then add `NOT NULL` constraint in a third step to avoid full-table locks.
- For large tables, avoid adding indexes in the same transaction as schema changes; use `CREATE INDEX CONCURRENTLY` (Postgres) or equivalent to avoid locking.
- Name migrations descriptively: `add_status_to_orders`, `backfill_user_email_index`; include a comment block explaining the business reason.
- Test every migration against a production-sized dataset in staging before merging; confirm rollback completes within acceptable downtime window.
