# Engineering Audit — lead-generation-POC

> **Log by Claude** · Generated 2026-09-17 · Branch `main` @ `dd0ea2c`

**Scope:** 4 source files (~380 LOC), Next.js 15.5 App Router + React 19 + Supabase.

**Verification performed:**

| Check | Result |
| --- | --- |
| `next build` | ✓ Compiled successfully (106 kB First Load JS) |
| `tsc --noEmit` | ✓ Clean |
| Secret scan across full git history | ✓ No credentials committed |
| Lint | ✗ No ESLint config; `next lint` is deprecated and drops into an interactive prompt |
| Tests | ✗ None exist |

**Verdict:** The visual craft is high and the scope discipline is genuinely good — the README refuses to invent claims (ratings, years, certifications), which is rare and correct. But the single code path that makes this a *lead generation* product — form → API → database — has no abuse controls, no observability, and no delivery guarantee. Everything else is polish on top of a pipe that can silently drop revenue.


---

## Status — remediation pass, 2026-09-17

All 14 numbered findings are resolved, alongside the manager's review feedback from
`Vineet demo2.pptx` and meetings 3–4. Verified with a clean build, a clean typecheck, API
tests against a running server, and a scripted browser run of the full customer journey.

| # | Finding | Status | Where |
| --- | --- | --- | --- |
| 1 | Unthrottled public write | Fixed | `lib/rate-limit.ts` (two tiers), origin + size + honeypot checks in `app/api/leads/route.ts` |
| 2 | Silent failure swallowing | Fixed | every path in `app/api/leads/route.ts` logs |
| 3 | Leads never delivered | Fixed | `lib/email.ts` — company + customer, per manager slide 4 |
| 4 | Figma script in production | Fixed | removed from `app/layout.tsx` |
| 5 | Phone regex accepted zero digits | Fixed | `isValidPhone` in `lib/leads.ts` |
| 6 | Service list in three places | Fixed | `config/site.ts` is the only source |
| 7 | PII without consent | Fixed | required consent checkbox + footer notice; privacy policy still outstanding |
| 8 | No security headers | Fixed | CSP, HSTS, frame/referrer/permissions in `next.config.ts` |
| 9 | Whole page was a client component | Fixed | `app/page.tsx` is a server component, four client islands |
| 10 | No image optimization, hotlinked Unsplash | Fixed | generated SVG swatches, `components/finish-plate.tsx` |
| 11 | Render-blocking `@import` fonts | Fixed | `next/font` in `app/layout.tsx` |
| 12 | Mobile nav disappeared | Fixed | `components/site-header.tsx` |
| 13 | Server error messages discarded | Fixed | `components/quote-form.tsx` surfaces them, incl. per-field |
| 14 | 2,697-character line | Fixed | page decomposed into components |

Hygiene: ESLint flat config added (`pnpm install` required to pull the new devDeps —
pnpm was not available in this environment so nothing was installed), `.DS_Store`
gitignored, live region rendered unconditionally, focus moves to the first error and to
the confirmation, fake "View finish" affordance removed, unused anon-key var dropped, RLS
intent documented in `supabase/schema.sql`.

### Manager feedback applied

| Source | Feedback | Applied |
| --- | --- | --- |
| Slides 1, 2, 4, 6 (12 tags) | "Font to small" | Type scale raised throughout; smallest text 14px (was 10px), body 17px (was 15px) |
| Slide 2 | "Label is garage, but seeing Living Room" | Stock photos replaced with generated material swatches that cannot contradict their label |
| Slide 3 | "Too many to add. Let's start with the Green ones" | Services chosen from the green/blue colour coding |
| Slide 4 | "Send Reply to both Company and Customer" | Dual notification emails |
| Slide 5 | "Adjust per Company's product offerings" | Single-file `config/site.ts` |
| Meeting 3 | Form reachable as the visitor scrolls | Sticky quote bar + sticky header |
| Meeting 3 | "Cookie cutter... blocks for content, blocks for images" | Same `config/site.ts` |
| Meeting 4 | "Limit them to like three" | Exactly three services |

### Still outstanding

- Privacy policy page and a retention rule for the `leads` table.
- Real project photography, and the client's approved business details.
- `pnpm install` to activate the linter.
- Rate limiter needs a shared store before multi-instance deployment.
- No automated test suite — the verification above was manual.

---

## Critical

### 1. `POST /api/leads` is an unauthenticated, unthrottled public write
`app/api/leads/route.ts:6`

No rate limit, no CAPTCHA, no honeypot field, no `Origin` check, no payload size cap. A trivial loop fills the `leads` table and drowns the real leads in noise. `name` and `address` are unbounded `text` (`supabase/schema.sql:5-6`) with no server-side length cap, so a single request can write megabytes.

**Fix:** hidden honeypot input, `Origin` header check, per-IP limit (Upstash / Vercel KV), and `.slice(0, 200)` on every string.

### 2. Every failure is swallowed silently
`app/api/leads/route.ts:23`

```ts
} catch { return NextResponse.json({ error: "..." }, { status: 500 }); }
```

No `console.error`, no logging anywhere in the repo (verified: zero matches). If Supabase rejects an insert — bad key, RLS change, constraint violation, network blip — the lead is gone and **nobody ever finds out**. For a lead-gen product a silent drop is a lost customer. This is the highest-value fix in the codebase and it is one line.

### 3. Captured leads are never delivered to anyone
No notification path exists anywhere in the project.

A row lands in Postgres and waits for a human to remember to open the Supabase dashboard. Real installers respond to leads in minutes. No email, no SMS, no webhook, no admin view. The POC captures leads but does not *generate* them in any operational sense.

### 4. A third-party design-tool script ships to production
`app/layout.tsx:11`

```tsx
<Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
```

This executes remote code from `mcp.figma.com` in every visitor's browser, on a page that collects **name, phone, and home address**. It is a build-time capture artifact, not a product dependency.

**Fix:** delete the line.

---

## High

### 5. Phone validation accepts input with zero digits
`app/api/leads/route.ts:13` and `app/page.tsx:54`

```
/^[+()\-\s\d]{7,24}$/
```

The character class is "any of `+ ( ) - space digit`". Both `"-------"` and `"((((((("` pass, on the client *and* the server. The only field that makes a lead actionable can be garbage.

**Fix:** strip non-digits, then require at least 7 digits remain.

### 6. The service list is defined in three places with no shared type
`app/page.tsx:5-9`, `app/api/leads/route.ts:4`, and a `CHECK` constraint in `supabase/schema.sql:7`.

Adding or renaming a service in two of three places produces either a silent 400 or a runtime constraint violation with no log (see #2).

**Fix:** extract one module; derive the DB constraint from it or replace the `CHECK` with a lookup table.

### 7. PII collected with no consent, no privacy policy, no retention
Name + phone + street address, no privacy link in the footer, no consent checkbox, no deletion story, and `status` is free-text with no lifecycle. Collecting a phone number for callback purposes in the US carries TCPA exposure without express consent language. Cheap to fix now, expensive later.

### 8. No security headers
`next.config.ts`

No CSP, `X-Frame-Options`, `Referrer-Policy`, or HSTS. A form collecting PII is clickjackable as shipped.

**Fix:** add a `headers()` block to the Next config.

---

## Medium

### 9. The entire landing page is a client component
`app/page.tsx:1`

`"use client"` sits at the top of a page that is ~95% static marketing markup. Only the quote form needs interactivity. The correct App Router shape is a server component page importing a small `<QuoteForm />` client island. Current cost is modest (106 kB First Load) but the whole tree has opted out of RSC, and `new Date().getFullYear()` (`app/page.tsx:80`) now runs in the browser for no reason.

### 10. Zero image optimization; hotlinked Unsplash in production
`next/image` is never imported (verified). Every image is a CSS `background-image` pointing at Unsplash — no lazy loading, no responsive sizing, no AVIF/WebP, no priority hint on the LCP element.

The `remotePatterns` config at `next.config.ts:4` is dead: it whitelists `images.unsplash.com` for a component the project does not use, and two images come from `plus.unsplash.com`, which is not even listed. It is also a third-party availability dependency for the hero.

### 11. Google Fonts loaded via CSS `@import`
`app/globals.css:1`

Three families, ten weights, render-blocking, and serialized *behind* the stylesheet — the worst-case font loading path. `next/font/google` self-hosts and eliminates the round trip. Direct LCP impact on a page whose entire job is conversion.

### 12. Mobile navigation disappears with no replacement
`app/globals.css`, `@media (max-width:760px)` → `.nav-links { display:none; }`

No hamburger, no drawer. Mobile visitors — the majority for this category — lose Services / Our work / About entirely. The anchor links remain in the DOM but are unreachable.

### 13. Server error messages are computed and then discarded
`app/page.tsx:62`

```ts
if (!response.ok) throw new Error("Request failed");
```

The route's three distinct messages (400 validation / 503 unconfigured / 500 failure) all collapse into one generic string. This makes the README's claim that "submissions fail safely with a configuration message" untrue from the user's perspective — they see "couldn't send your request."

### 14. `app/page.tsx:78` is a single 2,697-character line
The entire quote form on one line. Unreviewable in a diff, useless `git blame`, guaranteed merge conflicts. Lines 71 and 75–77 are 450–735 characters each. This is why the codebase *looks* small (82 lines) while carrying a full page.

---

## Low / Hygiene

| Item | Detail |
| --- | --- |
| No linter | `pnpm lint` runs `next lint`, deprecated in 15 and removed in 16 — it drops into an interactive setup prompt instead of linting. No ESLint config exists. |
| No tests, no CI | Nothing guards the validation logic or the three-way service-list duplication. |
| No a11y error announcement | On validation failure focus does not move and errors carry no `role="alert"` — screen reader users get no feedback. The success `role="status"` region (`app/page.tsx:78`) is *created* at the same moment as its content, which many screen readers will not announce; render the live region unconditionally and fill it. |
| Fake affordance | `"View finish ↗"` in each `figcaption` looks like a link and is not clickable. |
| Unused env var | `NEXT_PUBLIC_SUPABASE_ANON_KEY` is in `.env.example` but referenced nowhere in code. |
| RLS correct but fragile | `enable row level security` with **zero policies** is right (the service role bypasses it), but it is implicit — one careless `for select using (true)` later exposes every customer's address. Add a comment saying so. |
| Duplicate submissions | The button disables while sending, but a retry or back-nav creates a second row. No idempotency key, no dedup. |
| `.DS_Store` | Untracked and not gitignored. One line fixes it. |
| Git history | Commit messages are `dd`, `commit`, `first commit`. |

---

## Recommended order of work

1. `console.error(error)` in the route catch — 1 line, stops silent lead loss.
2. Delete the Figma script from `app/layout.tsx` — 1 line, removes third-party code from a PII page.
3. Fix the phone regex to require digits — 1 line, both sides.
4. Add honeypot + `Origin` check + string length caps — ~20 lines, closes the spam vector.
5. Send the lead somewhere a human will see it (Resend / email / webhook) — this is what turns the POC into a product.
6. Then: split `app/page.tsx` into a server page + client form island, move fonts to `next/font`, format line 78.

Items 1–4 are roughly an hour and address every critical finding. Items 5–6 are the difference between a demo and something you would hand a client.
