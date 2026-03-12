---
name: ruby-rails
description: Ruby on Rails best practices with MVC, ActiveRecord, and testing.
---

- Lint with `rubocop`; run `bundle exec rubocop -A` to auto-fix offenses; enforce in CI with `--no-autocorrect` flag.
- Run tests with `rspec`; use `FactoryBot` for fixtures and `shoulda-matchers` for model/controller assertions.
- Keep controllers thin: extract business logic to service objects (`app/services/`) or POROs; controllers only parse params, call a service, and render.
- Discipline ActiveRecord callbacks: avoid `after_save` / `before_destroy` for side-effects (email, notifications) — use service objects or jobs instead.
- Use `Strong Parameters` in controllers; validate at the model layer; never trust user input in raw SQL — always use parameterized queries or Arel.
- Scope background jobs to `app/jobs/`; use `perform_later` for everything that doesn't need to block the request cycle.
