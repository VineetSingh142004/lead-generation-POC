import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "epoxy-admin-session";

function signature() {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || password;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(`admin:${password}`).digest("hex");
}

export async function isAdmin() {
  const expected = signature();
  const actual = (await cookies()).get(COOKIE_NAME)?.value;
  if (!expected || !actual || expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

export function adminSessionToken() { return signature(); }
export const adminCookieName = COOKIE_NAME;
