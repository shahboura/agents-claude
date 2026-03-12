---
name: go
description: Go best practices for modules, error handling, concurrency, and testing.
---

- Lint with `golangci-lint run`; vet with `go vet ./...`; format with `gofmt` or `goimports`.
- Run tests with `go test ./...`; use table-driven tests with `t.Run` subtests.
- Always return and check errors explicitly; wrap with `fmt.Errorf("...: %w", err)`.
- Pass `context.Context` as the first argument to any I/O or long-running function.
- Prefer small interfaces defined at the point of use; avoid fat interfaces.
- Use goroutines + channels for concurrency; protect shared state with `sync.Mutex` or `sync/atomic`.
