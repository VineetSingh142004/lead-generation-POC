# Epoxy Atelier — Lead Generation Site

A premium marketing site and lead-capture flow for a resin flooring business, with an
authenticated admin at `/admin` for editing every word and photo on the page.

Built for the POC brief in `Lead_Generation_POC_Requirements.pdf`: a visitor sees three
services, picks one, gives four details, submits, and gets a confirmation — while the
business receives the lead by email immediately.

## Run locally

```bash
pnpm install
pnpm dev
```

```bash
pnpm build      # production build (runs ESLint)
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint, flat config
```

Copy `.env.example` to `.env.local` and fill it in. Apply
[`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor first — it
creates both tables, the RLS posture, and the storage bucket used by admin uploads.

## Architecture

| Path | Role |
| --- | --- |
| `app/page.tsx` | The marketing page. A server component; only four small client islands ship JS. |
| `lib/content.ts` | The content model and `DEFAULT_CONTENT`, the fallback the site renders from when there is no database. |
| `lib/content-store.ts` | Reads/writes the editable content. Reads **always** fall back to defaults. |
| `lib/leads.ts` | Lead validation, shared verbatim by the browser form and the API route. |
| `lib/auth.ts` | HMAC-signed admin session cookie. |
| `app/admin` | The editor. Auth-gated, `noindex`, `no-store`. |
| `components/hero-canvas.tsx` | The 3D hero. Dynamically imported, so three.js is not in the initial bundle. |

### Content is never hardcoded

Every string, service and photo comes from the content store. `DEFAULT_CONTENT` is the
seed; once an operator saves from `/admin`, the stored document takes over. A partial
document is merged over the defaults, so a half-filled row cannot blank a section.

This is the "cookie cutter" structure from meeting 3 and *"Adjust per Company's product
offerings"* from slide 5: retargeting the site at a different business is editing content,
not code.

## The 3D hero

A polished form over a mirror-finish floor, rendered with react-three-fiber.

It is there for a concrete reason, not decoration. The freely-licensed photography
available for this trade tops out at 1024px, which is visibly soft used full-bleed on a
retina display. A rendered scene is resolution-independent, and a wet-look poured floor is
literally the product — so the hero carries the brand while the real photographs below it
do the proof-of-work.

Costs are contained deliberately:

- dynamically imported (`ssr: false`), so three.js never lands in the initial payload
- the render loop is **suspended** whenever the canvas is scrolled out of view
- `prefers-reduced-motion` gets a single static frame, no animation
- the environment map is built in-scene from emissive planes rather than fetching an HDRI
  from a CDN, which is what lets the strict CSP stay strict
- a CSS-gradient fallback renders if WebGL is unavailable or still loading

## Photography

Ten CC0 (public-domain) photographs of genuine epoxy installations, stored in
`/public/photos` and served through `next/image`.

Every image was **viewed before use** and its label derives from its own source title.
That process is the fix for the review note *"Pictures are not matching the description:
Label is garage, but seeing Living Room"* — a card can no longer contradict its photo.
Watermarked, trademarked and `NC`/`ND`-licensed candidates were rejected; provenance for
each image is in `public/photos/manifest.json` and published at `/credits`.

These are reference placeholders. Replace them with the installer's own project
photography before launch — from `/admin`, no redeploy needed.

## Admin (`/admin`)

Sign in with `ADMIN_PASSWORD`. Edit brand and contact details, hero copy, services
(add/remove/reorder), the gallery, the approach points and the quote-form copy. Images can
be uploaded or picked from the bundled library, and alt text sits next to every picker
because a photo saved without it is an accessibility regression nobody notices later.

A save writes the whole document atomically, so the live site never shows half an edit.
The public page revalidates every 60s.

**Auth design.** One shared password, not a user database — this is a single-operator POC
and accounts would be more surface area than the brief calls for. It is still a real
session: HMAC-signed, `HttpOnly`, `SameSite=Strict`, expiring, with constant-time password
comparison and a hard per-IP rate limit on sign-in. With `ADMIN_PASSWORD` or
`ADMIN_SESSION_SECRET` unset, `/admin` refuses to authenticate anyone at all, so an
unconfigured deployment cannot be walked into.

## Lead capture

`POST /api/leads`:

1. Rejects mismatched `Origin` headers and oversized payloads.
2. Two-tier per-IP rate limit — a generous burst guard on every request, and a tight cap
   counted only **after** validation, so a customer who mistypes their phone number a few
   times is never locked out.
3. Silently drops honeypot submissions (the hidden `company` field).
4. Re-runs the exact validator the browser ran, against the **live** service list — not a
   constant, because renaming a service in `/admin` must not start rejecting leads.
5. Writes with `SUPABASE_SERVICE_ROLE_KEY`, which never reaches the browser.
6. Emails both the company and the customer.

Every failure path logs. A lead that cannot be stored is never silently dropped.

## Lead notifications

Per the review note *"Send Reply to both Company and Customer"*:

- **Company** gets the lead with `reply_to` set to the customer, so Reply goes to them.
- **Customer** gets a confirmation copy — only if they supplied an email address.

Email is optional on the form, which keeps the required set at the four fields the
requirements document specifies. Configure `RESEND_API_KEY`, `LEAD_FROM_EMAIL` and
`LEAD_NOTIFY_EMAIL`. Without them the lead is still captured and the skip is logged.

## Consent and privacy

The form collects name, phone, address and optionally email, and requires an explicit
consent checkbox before it will submit. RLS is enabled on both tables with **zero
policies** — the anon key cannot read or write either. Do not add a permissive policy to
`leads`; it holds customer addresses.

Still outstanding before launch: a linked privacy policy and a retention rule.

## Before launch

- Replace the placeholder business name, phone, email and service area in `/admin`.
- Replace the CC0 photography with the installer's own project photos.
- Add a privacy policy and a retention rule for `leads`.
- Move the rate limiter to Upstash/Vercel KV if this runs on more than one instance — the
  in-memory store is per-instance. See [`lib/rate-limit.ts`](./lib/rate-limit.ts).
- Set the environment variables in Vercel and deploy.

See [`LOG-BY-CLAUDE.md`](./LOG-BY-CLAUDE.md) for the engineering audit and what this build
changed in response to it.
