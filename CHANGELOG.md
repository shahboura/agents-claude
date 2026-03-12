# Changelog

All notable changes in this repository are documented here.

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
  - CI secrets scanning with gitleaks in validation workflow

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
