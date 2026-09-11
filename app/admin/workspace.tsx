"use client";

import { useMemo, useState } from "react";
import type { Lead } from "./page";

const statuses = ["pending", "active", "responded", "closed"] as const;
type Status = (typeof statuses)[number];
const labels: Record<Status, string> = { pending: "Pending", active: "Active", responded: "Responded", closed: "Closed" };

export function AdminDashboard({ initialLeads, connectionError }: { initialLeads: Lead[]; connectionError: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [notice, setNotice] = useState("");
  const metrics = useMemo<Record<Status, number>>(() => statuses.reduce<Record<Status, number>>((acc, status) => ({ ...acc, [status]: leads.filter((lead) => lead.status === status).length }), { pending: 0, active: 0, responded: 0, closed: 0 }), [leads]);
  const shown = filter === "all" ? leads : leads.filter((lead) => lead.status === filter);
  async function update(id: string, status: string) {
    const response = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { setNotice("Couldn’t save that change. Please try again."); return; }
    const { lead } = await response.json(); setLeads((current) => current.map((item) => item.id === id ? lead : item)); setNotice("");
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.assign("/admin/login"); }
  return <main className="admin-shell"><aside><a href="/" className="admin-brand">EPOXY <span>ATELIER</span></a><div className="side-title">LEAD DESK</div><nav><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All requests <b>{leads.length}</b></button>{statuses.map((status) => <button key={status} className={filter === status ? "selected" : ""} onClick={() => setFilter(status)}>{labels[status]} <b>{metrics[status]}</b></button>)}</nav><div className="sync-card"><span>GOOGLE SHEETS</span><p>Spreadsheet sync is ready to connect when you choose an automation provider.</p><button onClick={() => setNotice("Google Sheets sync is a planned connector. It will mirror new and updated leads once a Google account and automation endpoint are connected.")}>Plan integration ↗</button></div><button className="logout" onClick={logout}>Sign out</button></aside><section className="admin-content"><header><div><p className="admin-kicker">TODAY’S PIPELINE</p><h1>Every request.<br/><em>In one place.</em></h1></div><div className="connection"><i className={connectionError ? "offline" : ""}/>{connectionError || "Supabase connected"}</div></header><div className="metric-grid"><Metric label="Total leads" value={leads.length} note="All time"/><Metric label="Awaiting response" value={metrics.pending} note="Needs attention"/><Metric label="In progress" value={metrics.active} note="Active conversations"/><Metric label="Resolved" value={metrics.closed} note="Closed requests"/></div>{notice && <p className="admin-notice">{notice}</p>}<section className="lead-panel"><div className="panel-head"><div><p className="admin-kicker">REQUESTS</p><h2>{filter === "all" ? "Latest leads" : `${labels[filter]} leads`}</h2></div><p>{shown.length} showing</p></div>{connectionError ? <div className="empty"><span>01</span><h3>Database not connected.</h3><p>Add Supabase variables, run the supplied SQL, and incoming requests will appear here automatically.</p></div> : shown.length === 0 ? <div className="empty"><span>01</span><h3>No leads here yet.</h3><p>New quote requests will arrive here as <b>Pending</b>.</p></div> : <div className="lead-table"><div className="table-labels"><span>Contact</span><span>Project</span><span>Received</span><span>Status</span></div>{shown.map((lead) => <article className="lead-row" key={lead.id}><div><strong>{lead.name}</strong><a href={`tel:${lead.phone}`}>{lead.phone}</a><small>{lead.address}</small></div><div>{lead.service}</div><time>{new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time><select aria-label={`Status for ${lead.name}`} value={lead.status} onChange={(event) => update(lead.id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></article>)}</div>}</section></section></main>;
}
function Metric({ label, value, note }: { label: string; value: number; note: string }) { return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
