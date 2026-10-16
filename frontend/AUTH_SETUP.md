# Replio authentication (AUTH-001)

1. Create a Supabase project. Enable Email OTP/magic links and Google OAuth under Authentication > Providers.
2. Set Site URL and allowed redirect URLs in Supabase Authentication URL Configuration to the actual frontend origin (e.g. http://localhost:3001 and https://your-domain.example).
3. For Google OAuth, configure the Google Cloud OAuth consent screen and callback URL shown by Supabase. Do not place the Google client secret in the frontend.
4. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend runtime/build environment. Never use a service-role key in NEXT_PUBLIC variables.
5. Generate a random INTERNAL_API_SECRET (at least 32 bytes) and set the same value in both Next.js server and Go API. Do not commit it.
6. When Supabase auth is enabled, the Next.js generation route checks the user's access token via Supabase before proxying to Go. The Go API rejects generation requests without the internal secret. Direct access to Go must remain private.
7. Without Supabase variables, the existing local fake-provider flow remains available. This is for local development only; do not publish publicly without configuring authentication and cost limits.

Important: AUTH-001 adds login and protected generation transport. User-level monthly quotas, account deletion, generation history, and Stripe are NOT implemented. An authenticated user still shares the existing Go in-memory per-IP quota with other users behind the proxy. Do not treat this as production-ready billing protection.
