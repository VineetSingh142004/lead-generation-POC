"use client";

import { FormEvent, useState } from "react";
import "../admin.css";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (response.ok) window.location.assign("/admin");
    else { const result = await response.json(); setError(result.error); setLoading(false); }
  }
  return <main className="admin-login"><a href="/" className="admin-brand">EPOXY <span>ATELIER</span></a><form onSubmit={submit}><p className="admin-kicker">PRIVATE WORKSPACE</p><h1>Lead desk.</h1><p>Sign in to review and manage incoming requests.</p><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Enter dashboard password" /></label>{error && <small>{error}</small>}<button disabled={loading}>{loading ? "Opening…" : "Open workspace"}<span>↗</span></button></form></main>;
}
