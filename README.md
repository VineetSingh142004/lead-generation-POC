# Epoxy Atelier — Lead Generation POC

A conversion-focused Next.js landing page for an epoxy flooring business. The journey is
deliberately short: see three services, pick one, give four details, submit, get a
confirmation — and the business gets the lead by email immediately.

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill it in. Apply
[`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor first.

```bash
pnpm build      # production build
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint (flat config)
```

## Retargeting this template for another business

Everything a new business needs is in **one file**: [`config/site.ts`](./config/site.ts).
Business name, wordmark, all page copy, and the service list (name, description, finish)
live there. No other file hard-codes a business name, a service, or any marketing copy.

Swapping the three services is an edit to the `services` array. The lead form, the
database validation, the `<select>` options, the finish gallery and the confirmation email
all derive from it.

## Lead capture

`POST /api/leads`:

1. Rejects mismatched `Origin` headers and oversized payloads.
2. Applies a two-tier per-IP rate limit — a generous burst guard on every request, and a
   tight cap counted only *after* validation, so a customer who mistypes their phone
   number a few times is never locked out.
3. Drops silently-discarded honeypot submissions (the hidden `company` field).
4. Re-runs the exact validator the browser ran ([`lib/leads.ts`](./lib/leads.ts)).
5. Writes with `SUPABASE_SERVICE_ROLE_KEY`, which never reaches the browser.
6. Emails **both the company and the customer** (see below).

Every failure path logs. A lead that cannot be stored is never silently dropped.

## Lead notifications

Per the review feedback — *"Send Reply to both Company and Customer"*:

- **Company** receives the lead with `reply_to` set to the customer, so hitting Reply
  goes straight to them.
- **Customer** receives a confirmation copy — only if they supplied an email address.

Email is optional on the form, which keeps the required set at the four fields the
requirements document specifies. Configure `RESEND_API_KEY`, `LEAD_FROM_EMAIL` and
`LEAD_NOTIFY_EMAIL` to enable it. Without them the lead is still captured and the skip is
logged; email is a notification channel, never a gate on capturing the lead.

## Imagery

The service cards and finish gallery render **generated material swatches**, not stock
photos. This is deliberate: the previous build hot-linked Unsplash IDs whose contents
nobody could verify from the code, which is how a card labelled *Home / Garage Epoxy* ended
up showing a living room. A generated swatch cannot contradict its own label.

To use real photography, set `photo` and `photoAlt` on the service in `config/site.ts` and
drop the file in `/public`; it takes over from the swatch automatically.

## Consent and privacy

The form collects a name, phone number, street address and optionally an email. It
requires an explicit consent checkbox before it will submit, and the footer states what
the data is used for. Before launch you still need a linked privacy policy and a retention
rule for the `leads` table.

RLS is enabled on `public.leads` with **zero policies**, intentionally — the anon key
cannot read or write it at all. Do not add a permissive policy; that table holds customer
addresses.

## Before launch

- Replace `Epoxy Atelier` and the placeholder footer details in `config/site.ts` with the
  client's approved business information.
- Add real project photography (see **Imagery**).
- Add a privacy policy link and a data retention rule.
- Move the rate limiter to Upstash/Vercel KV if this runs on more than one instance —
  the in-memory store is per-instance. See [`lib/rate-limit.ts`](./lib/rate-limit.ts).
- Set the six environment variables in Vercel and deploy.

See [`docs/research.md`](./docs/research.md) for the design research and
[`LOG-BY-CLAUDE.md`](./LOG-BY-CLAUDE.md) for the engineering audit this build responds to.
