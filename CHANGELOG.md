# Changelog

All notable changes in this repository are documented here.

## [1.1.0](https://github.com/shahboura/agents-claude/compare/v1.0.2...v1.1.0) (2026-03-16)


### Features

* harden installer lifecycle and align skill schema/docs ([53e9e3c](https://github.com/shahboura/agents-claude/commit/53e9e3c4220ccde6e4bb18e72ac5fe6aab8f48e3))


### Bug Fixes

* enforce trusted uninstall paths and block symlink writes ([32c0d97](https://github.com/shahboura/agents-claude/commit/32c0d97e79afaf8e2ff3bb79f39131f7ab45ab49))
* harden uninstall path safety and legacy detection guards ([806d572](https://github.com/shahboura/agents-claude/commit/806d572552a176b5cb2c5bd5f0dbfe1bc1b22ad1))
* tighten legacy install detection and uninstall safety ([5de74e9](https://github.com/shahboura/agents-claude/commit/5de74e9a502857563edae10eaf4f62bb3f295a95))

## [1.0.2](https://github.com/shahboura/agents-claude/compare/v1.0.1...v1.0.2) (2026-03-12)


### Bug Fixes

* clarify quick-start runtime prerequisite ([3eee5e3](https://github.com/shahboura/agents-claude/commit/3eee5e3914730d4cffb3f43749bf90db97c6efc8))

## [1.0.1](https://github.com/shahboura/agents-claude/compare/v1.0.0...v1.0.1) (2026-03-12)


### Bug Fixes

* correct gitleaks go module install path ([8646e5a](https://github.com/shahboura/agents-claude/commit/8646e5ab05ec0186b17272f48e3c8d1c2f015c5f))

## 1.0.0 (2026-03-12)


### Bug Fixes

* migrate npm distribution to scoped package ([3517e1d](https://github.com/shahboura/agents-claude/commit/3517e1d77ad9867bc771a0ed6d1a2a90751cb880))
* remove unused module entrypoint metadata ([44e4e9b](https://github.com/shahboura/agents-claude/commit/44e4e9b0ae9fdfff01c724b5004c408f9dd0ff35))

## 1.2.2 (2026-03-11)

### Added

- Claude-native project structure under `.claude/`:
  - subagents in `.claude/agents/`
  - skills in `.claude/skills/`
  - shared settings in `.claude/settings.json`
  - rules and hooks for CI/security guardrails
- Project-level `CLAUDE.md` with concise, always-on instructions.
- Security and quality controls:
  - PreToolUse hook guardrails for risky bash and sensitive paths

### Changed

- Migrated installer to Claude-first behavior (`install.js`):
  - global install to `~/.claude`
  - project install to `./.claude` + `./CLAUDE.md`
  - update flow preserves existing settings and writes recommended settings files
- Updated docs and README from OpenCode terminology to Claude Code terminology.
- Updated release/package identity to `agents-claude`.

### Removed

- Removed legacy OpenCode artifacts from active repository surface:
  - `.opencode/**`
  - `opencode.json`
