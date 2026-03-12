---
name: dotnet
description: Clean Architecture principles and C# conventions for .NET projects.
---

- Format with `dotnet format`; analyze with `dotnet build -warnaserror`; lint with Roslyn analyzers.
- Run tests with `dotnet test`; use `xUnit` for the test runner; mock with `NSubstitute` or `Moq`. For assertions: use `AwesomeAssertions` (fluent `.Should().Be()` style) or `Shouldly` (`.ShouldBe()` style).
- Enforce nullable reference types (`<Nullable>enable</Nullable>`); treat all warnings as errors in CI.
- Use constructor injection throughout; avoid service locator and static state.
- Use `record` types for immutable DTOs and value objects; `sealed` classes by default.
- Validate at boundaries with `FluentValidation`; never trust raw input past the entry layer.
