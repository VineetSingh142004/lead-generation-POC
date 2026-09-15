# Epoxy Atelier Lead Generation POC

A premium, conversion-focused Next.js landing page for an epoxy flooring business. It keeps the POC journey intentionally short: select a service, provide contact details, submit, receive confirmation.

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and add the Supabase values before enabling live lead capture. Apply [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor first.

## Lead capture

`POST /api/leads` validates contact details server-side and writes with a server-only Supabase secret/service key, which is never exposed to the browser. New requests begin as `pending` and include an email address for the future customer-confirmation workflow. Without those environment variables, submissions fail safely with a configuration message.

## Admin workspace

`/admin` is protected by `ADMIN_DASHBOARD_PASSWORD` and displays the same Supabase `leads` rows. It supports Pending, Active, Responded, and Closed states. Email alerts and Google Sheets are deliberate integration placeholders: they need an approved email/automation provider and Google authorization before live data can be sent anywhere else.

## Before launch

- Replace `Epoxy Atelier` and the placeholder footer details with the client’s approved business information.
- Replace the visual references with licensed photography of the installer’s own projects.
- Add the Supabase variables plus `ADMIN_DASHBOARD_PASSWORD` and `ADMIN_SESSION_SECRET` in Vercel, then deploy.

See [`docs/research.md`](./docs/research.md) for the design and conversion research behind the implementation.
