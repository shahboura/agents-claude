---
name: ruby-rails
description: Ruby on Rails best practices with MVC, ActiveRecord, and testing.
---

- Lint with `bundle exec rubocop`; auto-fix locally with `-A` and keep CI on non-autocorrect mode.
- Run tests with `bundle exec rspec`; use `FactoryBot` and focused request/model specs.
- Keep controllers thin: parse params, authorize, delegate to services, render response.
- Prefer service objects and jobs for side-effects; avoid callback-heavy business logic.
- Use Strong Parameters and model validations; never interpolate raw user input into SQL.
- Keep domain logic out of views/helpers; use presenters/decorators when view composition grows.
- Use idempotent background jobs and retry-safe external integrations.
- Protect N+1 hot paths with eager loading and query-level assertions in specs.
