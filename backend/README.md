# Replio Go backend (BE-001)

This is a minimal HTTP server using Go's standard `net/http` package.

## Local development

Go 1.23+ is required for this bootstrap (the final project Go version is not yet decided).

```sh
cd backend
go run ./cmd/api
```

The default port is 8080. Override it with `PORT=9090 go run ./cmd/api`.
Stop with Ctrl+C. Invalid PORT values cause a startup error.

```sh
cd backend
go test ./...
```

All routes currently return HTTP 404. `/healthz`, API routes, LLM integrations, auth, and persistence are intentionally out of scope for BE-001.

This work is tracked in [Issue #8](https://github.com/yuukioda999/replio/issues/8).
