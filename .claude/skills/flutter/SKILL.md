---
name: flutter
description: Flutter/Dart best practices with Riverpod, freezed, and feature-based architecture.
---

- Analyze with `flutter analyze`; format with `dart format .`; run tests with `flutter test`.
- Use Riverpod (`flutter_riverpod`) for state management; prefer `AsyncNotifierProvider` for async state.
- Use `freezed` for immutable data classes and union types; run `dart run build_runner build` after model changes.
- Structure by feature: `lib/features/<name>/{data,domain,presentation}/`; keep widgets thin and testable.
- Write widget tests with `flutter_test` + `mocktail` for mocking; aim for `testWidgets` coverage on all screen-level widgets.
- Use `go_router` for navigation; define routes as constants; avoid `Navigator.push` directly in widgets.
