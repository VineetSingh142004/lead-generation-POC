import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateLead } from "@/lib/leads";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { notifyLead } from "@/lib/email";

/** Reject bodies larger than this outright — nothing legitimate comes close. */
const MAX_BODY_BYTES = 4096;

/**
 * Same-origin check.
 *
 * Rule: if an Origin header is present it MUST match our host; if it is absent we allow
 * the request and let the rate limiter and honeypot handle it.
 *
 * Rejecting absent-Origin requests outright would be stricter but would also drop real
 * leads whenever a privacy extension or corporate proxy strips the header — and a lost
 * customer costs more here than a spam row. Browsers always send Origin on cross-origin
 * POSTs, so genuine CSRF is still blocked.
 */
function isTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (!isTrustedOrigin(request)) {
    console.warn("[leads] rejected cross-origin submission", { ip, origin: request.headers.get("origin") });
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  // Tier 1: generous burst guard on every request.
  const burst = rateLimit(ip, "burst");
  if (!burst.ok) {
    console.warn("[leads] burst rate limited", { ip, retryAfterSeconds: burst.retryAfterSeconds });
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That request was too large." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "That request was too large." }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "We couldn't read that request." }, { status: 400 });
  }

  /**
   * Honeypot. The form renders a hidden "company" field that real users never see and
   * never fill. Bots fill every input they find. Respond 200 so the bot believes it won.
   */
  if (typeof body.company === "string" && body.company.trim() !== "") {
    console.warn("[leads] honeypot triggered", { ip });
    return NextResponse.json({ ok: true });
  }

  // Same validator the browser runs, re-run here as the real gate.
  const { errors, lead } = validateLead(body);
  if (Object.keys(errors).length) {
    return NextResponse.json(
      { error: "Please complete each field with valid information.", fieldErrors: errors },
      { status: 400 },
    );
  }

  // Tier 2: tight limit on submissions that would actually create a row. Checked only
  // after validation so mistyped input never counts against a real customer.
  const submit = rateLimit(ip, "submit");
  if (!submit.ok) {
    console.warn("[leads] submit rate limited", { ip, retryAfterSeconds: submit.retryAfterSeconds });
    return NextResponse.json(
      { error: "We've already received a few requests from you. Someone will be in touch shortly." },
      { status: 429, headers: { "Retry-After": String(submit.retryAfterSeconds) } },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[leads] Supabase env vars missing — lead could not be stored", { service: lead.service });
    return NextResponse.json(
      { error: "Lead storage has not been configured yet. Please call us directly." },
      { status: 503 },
    );
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("leads").insert({ ...lead, status: "new" });
    if (error) {
      // Audit finding #2: this used to be swallowed. A dropped lead is a lost customer,
      // and nobody could tell it had happened.
      console.error("[leads] Supabase insert failed", { message: error.message, details: error.details, code: error.code });
      return NextResponse.json({ error: "We couldn't save that request. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("[leads] unexpected storage error", error);
    return NextResponse.json({ error: "We couldn't save that request. Please try again." }, { status: 500 });
  }

  console.info("[leads] captured", { service: lead.service, hasEmail: Boolean(lead.email) });

  // The lead is safe. Email is a notification, not a gate — failures are logged, not surfaced.
  const delivery = await notifyLead(lead);
  if (delivery.skipped) console.warn("[leads] notifications skipped:", delivery.skipped);
  else console.info("[leads] notifications", delivery);

  return NextResponse.json({ ok: true });
}
