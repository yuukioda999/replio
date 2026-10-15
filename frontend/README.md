# Replio frontend (FE-001)

Next.js + TypeScript UI. Requires Node.js 20+ and Go API.

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Start Go API separately (from `backend/`): `GENERATION_ENABLED=true LLM_PROVIDER=fake go run ./cmd/api`. Open http://localhost:3000. Without `GENERATION_ENABLED=true`, API returns 503 by design. `GO_API_ORIGIN` is a server-only Next.js rewrite destination. Never use `NEXT_PUBLIC_` for API keys or internal origins. This proxy is intended for local development; public deployment requires a security review of ingress, authentication/abuse controls, and reverse proxy routing.

Checks: `npm run typecheck`, `npm test`, `npm run build`. Fake responses are templates, not real AI generation.
