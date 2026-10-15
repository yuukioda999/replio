# Docker Compose ローカル統合環境 (DEV-001)

Docker Desktop を起動して、リポジトリ直下で以下を実行します。

```sh
docker compose up --build
```

- UI: http://localhost:3001
- API: Compose内部の `http://api:8080`（ホストへ公開しません）
- Fake LLMのみ。Claude APIキーは不要です。
- 既に3001番を使っている場合は、`compose.yaml` の `127.0.0.1:3001:3000` のホスト側ポートを変更してください。
- 停止: `docker compose down`
- ログ: `docker compose logs -f`

これはローカル開発専用です。公開デプロイでは `GENERATION_ENABLED` を既定の無効状態に戻し、認証・悪用防止・HTTPS・秘密情報の管理を別途設計してください。
