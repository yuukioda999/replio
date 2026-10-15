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


## APIガード（SEC-001）

**デフォルトでは生成APIは停止しています。** ローカルで試す場合に限り `GENERATION_ENABLED=true` を設定してください。`GET /healthz` は停止中も利用できます。

- `GENERATION_ENABLED`: `true` の場合のみ生成POSTを許可（既定は停止）
- `GENERATION_MAX_REQUESTS_PER_HOUR`: 接続元IPごとの1時間あたりリクエスト数。暫定既定10（1〜10000）
- `GENERATION_MAX_CONCURRENT`: 同時生成数。暫定既定2（1〜100）
- 制限時は429と`Retry-After`、停止中・混雑時は503を返す

**制約:** 接続元IPは直接のTCPピアの`RemoteAddr`を使い、`X-Forwarded-For`は信頼しません。リバースプロキシ配下では全利用者が同一IPに見えるため、本番では信頼できるプロキシ設定・IP取得方法を別途設計してください。制限はプロセス内メモリであり、再起動・複数インスタンスでリセット・分散されます。1万件超の異なるIPの記録を防ぐため容量ガードがあります。**請求額の上限を保証する機能ではありません。** 公開前に外部の支出監視、緊急停止運用、CAPTCHA等のBot対策を別途検討してください。
