

/**
 * Lead notification email.
 *
 * Manager feedback, slide 4 (pointing at the quote form):
 *   "Send Reply to both Company and Customer"
 *
 * Sends two messages per lead:
 *   1. COMPANY  -> the actionable lead, with reply-to set to the customer.
 *   2. CUSTOMER -> a confirmation copy (only when they supplied an email address).
 *
 * Uses Resend's HTTP API directly — no SDK dependency for two requests.
 * If RESEND_API_KEY is absent the lead is still saved and the failure is logged;
 * email is a notification channel, never a gate on capturing the lead.
 */

type Lead = {
  name: string;
  phone: string;
  address: string;
  service: string;
  email: string | null;
};

/** Passed in by the caller so the emails carry whatever name the operator has set. */
type Branding = { businessName: string; successBody: string };

const ENDPOINT = "https://api.resend.com/emails";

async function send(payload: Record<string, unknown>, apiKey: string) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

/**
 * Fires both emails. Never throws — a delivery failure must not fail the request
 * for a lead that is already safely in the database. Returns what actually happened
 * so the route can log it.
 */
export async function notifyLead(lead: Lead, branding: Branding): Promise<{ company: boolean; customer: boolean; skipped?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  const to = process.env.LEAD_NOTIFY_EMAIL;

  if (!apiKey || !from || !to) {
    return { company: false, customer: false, skipped: "RESEND_API_KEY / LEAD_FROM_EMAIL / LEAD_NOTIFY_EMAIL not configured" };
  }

  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Address / region", lead.address],
    ["Service", lead.service],
    ["Email", lead.email ?? "not provided"],
  ];

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 18px 8px 0;color:#57534e;font:600 15px system-ui,sans-serif;white-space:nowrap">${label}</td>` +
        `<td style="padding:8px 0;color:#1c1917;font:600 17px system-ui,sans-serif">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const result = { company: false, customer: false };

  // 1. The company's copy — the one that must never be missed.
  try {
    await send(
      {
        from,
        to: [to],
        // Lets the business hit Reply and land in the customer's inbox directly.
        ...(lead.email ? { reply_to: lead.email } : {}),
        subject: `New lead: ${lead.service} — ${lead.name}`,
        html:
          `<div style="max-width:560px;margin:0 auto;padding:32px 24px">` +
          `<p style="margin:0 0 6px;color:#a8a29e;font:600 13px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase">New quote request</p>` +
          `<h1 style="margin:0 0 24px;color:#1c1917;font:700 26px system-ui,sans-serif">${escapeHtml(lead.name)}</h1>` +
          `<table style="border-collapse:collapse">${table}</table>` +
          `<p style="margin:28px 0 0;color:#57534e;font:400 15px system-ui,sans-serif">Submitted via ${escapeHtml(branding.businessName)}.</p>` +
          `</div>`,
      },
      apiKey,
    );
    result.company = true;
  } catch (error) {
    console.error("[leads] company notification failed", error);
  }

  // 2. The customer's confirmation copy — only possible if they gave us an address.
  if (lead.email) {
    try {
      await send(
        {
          from,
          to: [lead.email],
          subject: `We've received your request — ${branding.businessName}`,
          html:
            `<div style="max-width:560px;margin:0 auto;padding:32px 24px">` +
            `<h1 style="margin:0 0 14px;color:#1c1917;font:700 26px system-ui,sans-serif">Thank you, ${escapeHtml(lead.name.split(" ")[0])}.</h1>` +
            `<p style="margin:0 0 24px;color:#44403c;font:400 17px/1.6 system-ui,sans-serif">${escapeHtml(branding.successBody)}</p>` +
            `<table style="border-collapse:collapse">${table}</table>` +
            `<p style="margin:28px 0 0;color:#57534e;font:400 15px/1.6 system-ui,sans-serif">If any of this is wrong, just reply to this email and we'll correct it.</p>` +
            `<p style="margin:18px 0 0;color:#a8a29e;font:400 14px system-ui,sans-serif">${escapeHtml(branding.businessName)}</p>` +
            `</div>`,
        },
        apiKey,
      );
      result.customer = true;
    } catch (error) {
      console.error("[leads] customer confirmation failed", error);
    }
  }

  return result;
}
