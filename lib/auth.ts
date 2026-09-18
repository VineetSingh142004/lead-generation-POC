import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session handling for /admin.
 *
 * Deliberately a single shared password rather than a user database: this is a
 * one-operator POC, and a real account system would be more surface area than the
 * brief calls for. It is still a proper session — the cookie is HMAC-signed, HttpOnly,
 * SameSite=Strict and expires — not a "password in localStorage" arrangement.
 *
 * Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET. With either missing, /admin refuses to
 * authenticate anyone at all, so an unconfigured deployment cannot be walked into.
 */

const COOKIE = "ea_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Length-safe constant-time comparison — timingSafeEqual throws on length mismatch. */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Still burn a comparison so the failure takes a similar amount of time.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !adminConfigured()) return false;
  return safeEqual(candidate, expected);
}

export function createSessionValue() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  // Nonce keeps two sessions issued in the same millisecond from colliding.
  const payload = `${expiresAt}.${randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

function valid(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, mac] = parts;
  if (!safeEqual(mac, sign(`${expiresAt}.${nonce}`))) return false;
  const exp = Number(expiresAt);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAuthenticated() {
  const store = await cookies();
  return valid(store.get(COOKIE)?.value);
}

export const sessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  },
};
