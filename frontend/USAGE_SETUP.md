# User quotas (USAGE-001)

1. Apply supabase/migrations/202610160001_generation_quotas.sql to your Supabase project's SQL editor.
2. Configure Supabase Auth as documented in AUTH_SETUP.md.
3. Set SUPABASE_SERVICE_ROLE_KEY only on the Next.js server. NEVER use a NEXT_PUBLIC prefix or send this key to the browser.
4. When Supabase Auth is configured, every generation reserves one of 20 monthly Free requests in PostgreSQL (UTC month). Parallel requests are serialized by PostgreSQL row locks.
5. The quota is refunded when the upstream Go API returns a non-2xx response or the proxy fetch fails. It remains charged when Go reports success.
6. Without Auth configuration, local fake-provider generation remains available for development. Do not publicly expose this mode.

Limitations: no paid plans or Stripe, no user-facing remaining quota display, no global monetary budget cap, no automatic recovery of abandoned reservations on process crashes. Supabase database usage and API calls have costs. Production launch requires a global spend kill-switch, abuse protections, and proper deployment configuration.
