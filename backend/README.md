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

## Health check (BE-002)

`GET /healthz` returns HTTP 200 with JSON `{"status":"ok"}`. Other methods on `/healthz` return HTTP 405 and `Allow: GET`. Unknown routes return 404.

LLM integrations, auth, persistence, and application API routes are not implemented yet.

This work is tracked in [Issue #8](https://github.com/yuukioda999/replio/issues/8).


## LLM provider (BE-004)

By default, the API uses a deterministic Fake LLM; no API key or external requests are needed.

To use Claude locally, set the environment variables below before starting the API:

```sh
export LLM_PROVIDER=claude
export ANTHROPIC_API_KEY='your-secret-key'
export CLAUDE_MODEL='your-enabled-model-id'
export CLAUDE_MAX_TOKENS=512 # optional, 1-4096
cd backend && go run ./cmd/api
```

Do not commit API keys or customer messages. The Claude HTTP client has a 20-second timeout. Errors are returned as generic JSON and do not include upstream response bodies. **Do not publicly deploy the generation API until anonymous usage limits, abuse prevention, and an enforceable cost cap are implemented.** Claude usage incurs charges. Keep `LLM_PROVIDER=fake` while testing locally or in CI.
