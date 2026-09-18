"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { validateLead, type FieldErrors } from "@/lib/leads";
import type { SiteContent } from "@/lib/content";

/**
 * The quote form — the only genuinely interactive part of the page, isolated as a client
 * island so everything around it stays a server component.
 *
 * Requirements PDF §4: four required fields (name, phone, address, service). Email is a
 * fifth, optional field; it exists only so the customer can be sent their own copy of the
 * confirmation, per the manager's "Send Reply to both Company and Customer".
 */
export function QuoteForm({
  services,
  copy,
  businessName,
}: {
  services: { id: string; name: string }[];
  copy: SiteContent["quote"];
  businessName: string;
}) {
  const [service, setService] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPick(event: Event) {
      setService((event as CustomEvent<string>).detail);
      setFieldErrors((c) => { const n = { ...c }; delete n.service; return n; });
    }
    window.addEventListener("service:selected", onPick);
    return () => window.removeEventListener("service:selected", onPick);
  }, []);

  useEffect(() => { if (sent) successRef.current?.focus(); }, [sent]);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function focusFirstError(errors: FieldErrors) {
    const first = Object.keys(errors)[0];
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      email: String(form.get("email") ?? ""),
      service: String(form.get("service") ?? ""),
      consent: form.get("consent") === "on",
      company: String(form.get("company") ?? ""), // honeypot
    };

    const { errors } = validateLead(payload, services.map((s) => s.name));
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      focusFirstError(errors);
      return;
    }

    setFieldErrors({});
    setSending(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          focusFirstError(data.fieldErrors);
        }
        setFormError(data.error ?? "We couldn't send that just now. Please try again in a moment.");
        return;
      }
      setSent(true);
    } catch {
      setFormError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="quote-form-slot">
      {/* Rendered unconditionally: a live region created at the same moment as its
          content is frequently never announced. */}
      <div className="sr-only" role="status" aria-live="polite">{sent ? copy.successBody : ""}</div>

      {sent ? (
        <div className="success" ref={successRef} tabIndex={-1}>
          <div className="success-mark" aria-hidden="true">✓</div>
          <h3>{copy.successHeading}</h3>
          <p>{copy.successBody}</p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate>
          <div className="hp" aria-hidden="true">
            <label htmlFor="company">Company (leave blank)</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="field-row">
            <label>
              <span className="label-text">Your name <span className="required-mark" aria-hidden="true">*</span></span>
              <input required name="name" placeholder="Jordan Ellis" autoComplete="name" maxLength={120}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
                onChange={() => clearFieldError("name")} />
              {fieldErrors.name && <span className="field-error" id="name-error" role="alert">{fieldErrors.name}</span>}
            </label>

            <label>
              <span className="label-text">Phone <span className="required-mark" aria-hidden="true">*</span></span>
              <input required name="phone" inputMode="tel" autoComplete="tel" placeholder="(312) 555 0143" maxLength={24}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                onChange={() => clearFieldError("phone")} />
              {fieldErrors.phone && <span className="field-error" id="phone-error" role="alert">{fieldErrors.phone}</span>}
            </label>
          </div>

          <label>
            <span className="label-text">Address or area <span className="required-mark" aria-hidden="true">*</span></span>
            <input required name="address" autoComplete="street-address" placeholder="Oak Park, IL" maxLength={200}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={fieldErrors.address ? "address-error" : undefined}
              onChange={() => clearFieldError("address")} />
            {fieldErrors.address && <span className="field-error" id="address-error" role="alert">{fieldErrors.address}</span>}
          </label>

          <label>
            <span className="label-text">What do you need? <span className="required-mark" aria-hidden="true">*</span></span>
            <select required name="service" value={service}
              aria-invalid={Boolean(fieldErrors.service)}
              aria-describedby={fieldErrors.service ? "service-error" : undefined}
              onChange={(e) => { setService(e.target.value); clearFieldError("service"); }}>
              <option value="" disabled>Choose a service</option>
              {services.map(({ id, name }) => <option key={id}>{name}</option>)}
            </select>
            {fieldErrors.service && <span className="field-error" id="service-error" role="alert">{fieldErrors.service}</span>}
          </label>

          <label>
            <span className="label-text">Email <span className="optional-mark">optional — we&rsquo;ll send you a copy</span></span>
            <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" maxLength={254}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={() => clearFieldError("email")} />
            {fieldErrors.email && <span className="field-error" id="email-error" role="alert">{fieldErrors.email}</span>}
          </label>

          <label className="consent">
            <input type="checkbox" name="consent"
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
              onChange={() => clearFieldError("consent")} />
            <span>{businessName} can contact me about this request by phone or email.<span className="required-mark" aria-hidden="true">{" *"}</span></span>
            {fieldErrors.consent && <span className="field-error" id="consent-error" role="alert">{fieldErrors.consent}</span>}
          </label>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button className="submit" disabled={sending} aria-busy={sending}>
            <span>{sending ? "Sending…" : "Request my quote"}</span>
            <span className="submit-arrow" aria-hidden="true">→</span>
          </button>
        </form>
      )}
    </div>
  );
}
