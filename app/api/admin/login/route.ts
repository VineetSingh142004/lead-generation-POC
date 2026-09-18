import { NextResponse } from "next/server";
import { adminConfigured, createSessionValue, sessionCookie, verifyPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Admin sign-in. Rate limited hard: password guessing is the only realistic attack on a
 * single-password admin, so the limiter is the primary defence and is applied per IP
 * before the password is ever compared.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  const limit = rateLimit(ip, "login");
  if (!limit.ok) {
    console.warn("[admin] login rate limited", { ip, retryAfterSeconds: limit.retryAfterSeconds });
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!adminConfigured()) {
    console.error("[admin] ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not set — refusing all logins");
    return NextResponse.json(
      { error: "Admin access has not been configured on this deployment." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "We couldn't read that request." }, { status: 400 });
  }

  if (!verifyPassword(password)) {
    console.warn("[admin] failed login", { ip });
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }

  console.info("[admin] login succeeded", { ip });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, createSessionValue(), sessionCookie.options);
  return response;
}
