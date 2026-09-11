import { NextResponse } from "next/server";
import { adminCookieName, adminSessionToken } from "@/lib/admin-session";

export async function POST(request: Request) {
  const { password } = await request.json();
  const configured = process.env.ADMIN_DASHBOARD_PASSWORD;
  const token = adminSessionToken();
  if (!configured || !token || password !== configured) {
    return NextResponse.json({ error: "Invalid password or dashboard is not configured." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
