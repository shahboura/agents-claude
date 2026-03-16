---
name: flutter
description: Flutter/Dart best practices with Riverpod, freezed, and feature-based architecture.
---

- Analyze with `flutter analyze`; format with `dart format --set-exit-if-changed .`; run tests with `flutter test`.
- Use Riverpod for app state; keep `setState` for local-only UI concerns.
- Use immutable models (`freezed` where appropriate) and regenerate code after model changes.
- Structure by feature: `lib/features/<name>/{data,domain,presentation}/`; keep widgets thin and testable.
- Prefer `StatelessWidget`/`ConsumerWidget`; use `StatefulWidget` only when lifecycle state is required.
- Use `go_router` for app-level navigation; avoid scattered `Navigator.push` flows.
- Enforce design consistency through `ThemeExtension` and shared spacing/typography tokens.
- Require risk-based test coverage across unit + widget tests for critical flows.
