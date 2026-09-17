"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { services, site } from "@/config/site";
import { validateLead, type FieldErrors } from "@/lib/leads";

/**
 * The only interactive part of the page, isolated as a client island so the rest of
 * the landing page can stay a server component (audit finding #9).
 *
 * Reads the preselected service from the ?service= query the service cards link to,
 * which keeps card -> form selection working without lifting state into a client page.
 */
export function QuoteForm({ preselected }: { preselected?: string }) {
  const [service, setService] = useState(preselected ?? "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Keep the select in sync when a service card is clicked after first render.
  useEffect(() => {
    function onPick(event: Event) {
      const picked = (event as CustomEvent<string>).detail;
      setService(picked);
      setFieldErrors((current) => ({ ...current, service: undefined }));
    }
    window.addEventListener("service:selected", onPick);
    return () => window.removeEventListener("service:selected", onPick);
  }, []);

  // Move focus to the confirmation so keyboard and screen reader users are told it worked.
  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

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
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
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
      // Honeypot — hidden from real users, irresistible to bots.
      company: String(form.get("company") ?? ""),
    };

    // Same validator the server runs, for instant inline feedback.
    const { errors } = validateLead(payload);
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
        // Audit finding #13: surface what the server actually said instead of one generic string.
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          focusFirstError(data.fieldErrors);
        }
        setFormError(data.error ?? "We couldn't send your request just now. Please try again in a moment.");
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
      {/*
        Live region is rendered unconditionally and filled later. A region created at the
        same moment as its content is frequently not announced (audit, a11y note).
      */}
      <div className="sr-only" role="status" aria-live="polite">
        {sent ? site.quote.successBody : ""}
      </div>

      {sent ? (
        <div className="success" ref={successRef} tabIndex={-1}>
          <div className="success-mark" aria-hidden="true">✓</div>
          <h3>{site.quote.successHeading}</h3>
          <p>{site.quote.successBody}</p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate>
          <p className="form-intro">
            Four quick details and we'll call you back. Fields marked <span className="required-mark">*</span> are required.
          </p>

          {/* Honeypot: off-screen, not tabbable, not announced. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="company">Company (leave blank)</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <label>
            <span className="label-text">Full name <span className="required-mark" aria-hidden="true">*</span></span>
            <input
              required
              name="name"
              placeholder="Your name"
              autoComplete="name"
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              onChange={() => clearFieldError("name")}
            />
            {fieldErrors.name && <span className="field-error" id="name-error" role="alert">{fieldErrors.name}</span>}
          </label>

          <label>
            <span className="label-text">Phone number <span className="required-mark" aria-hidden="true">*</span></span>
            <input
              required
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(000) 000-0000"
              maxLength={24}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              onChange={() => clearFieldError("phone")}
            />
            {fieldErrors.phone && <span className="field-error" id="phone-error" role="alert">{fieldErrors.phone}</span>}
          </label>

          <label>
            <span className="label-text">Address / region <span className="required-mark" aria-hidden="true">*</span></span>
            <input
              required
              name="address"
              autoComplete="street-address"
              placeholder="City or service area"
              maxLength={200}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={fieldErrors.address ? "address-error" : undefined}
              onChange={() => clearFieldError("address")}
            />
            {fieldErrors.address && <span className="field-error" id="address-error" role="alert">{fieldErrors.address}</span>}
          </label>

          <label>
            <span className="label-text">Selected service <span className="required-mark" aria-hidden="true">*</span></span>
            <select
              required
              name="service"
              value={service}
              aria-invalid={Boolean(fieldErrors.service)}
              aria-describedby={fieldErrors.service ? "service-error" : undefined}
              onChange={(event) => {
                setService(event.target.value);
                clearFieldError("service");
              }}
            >
              <option value="" disabled>Choose a service</option>
              {services.map(({ name }) => <option key={name}>{name}</option>)}
            </select>
            {fieldErrors.service && <span className="field-error" id="service-error" role="alert">{fieldErrors.service}</span>}
          </label>

          {/*
            Optional, and the reason the customer confirmation email is possible at all
            (manager, slide 4: "Send Reply to both Company and Customer"). Kept optional so
            the required set stays at the four fields the requirements PDF specifies.
          */}
          <label>
            <span className="label-text">Email <span className="optional-mark">optional — for your confirmation copy</span></span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              onChange={() => clearFieldError("email")}
            />
            {fieldErrors.email && <span className="field-error" id="email-error" role="alert">{fieldErrors.email}</span>}
          </label>

          <label className="consent">
            <input
              type="checkbox"
              name="consent"
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
              onChange={() => clearFieldError("consent")}
            />
            <span>
              Yes, {site.businessName} may contact me about this request by phone or
              email.<span className="required-mark" aria-hidden="true">{"\u00a0*"}</span>
            </span>
            {fieldErrors.consent && <span className="field-error" id="consent-error" role="alert">{fieldErrors.consent}</span>}
          </label>

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button className="submit" disabled={sending} aria-busy={sending}>
            {sending ? "Sending your request…" : "Request a free quote"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
    </div>
  );
}
