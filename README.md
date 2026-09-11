# Epoxy Atelier Lead Generation POC

A premium, conversion-focused Next.js landing page for an epoxy flooring business. It keeps the POC journey intentionally short: select a service, give four details, submit, receive confirmation.

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and add the Supabase values before enabling live lead capture. Apply [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor first.

## Lead capture

`POST /api/leads` validates all four fields server-side and writes with `SUPABASE_SERVICE_ROLE_KEY`, which is never exposed to the browser. Without those environment variables, submissions fail safely with a configuration message.

## Before launch

- Replace `Epoxy Atelier` and the placeholder footer details with the client’s approved business information.
- Replace the visual references with licensed photography of the installer’s own projects.
- Add the three environment variables in Vercel and deploy.

See [`docs/research.md`](./docs/research.md) for the design and conversion research behind the implementation.
